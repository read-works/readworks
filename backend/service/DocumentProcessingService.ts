import { Server, Socket } from 'socket.io';
import { Document } from '../models/Document';
import { Page } from '../models/Page';
import { PageWord } from '../models/PageWord';
import { OCRService } from './OCRService';
import { PopplerService } from './PopplerService';
import { ImageResizeService } from './ImageResizeService';
import { PageAlignmentService } from './search/CoordinateAlignmentService';
import { XMLParser } from 'fast-xml-parser';
import { appLogger } from '../helpers/app-logger';
import path from 'path';
import { SEARCHSTRING_CLEANUP } from '../helpers/regex-patterns';
import imagesSize from 'image-size';

const DEFAULT_THUMBNAIL_WIDTH = 610;
const RATIO = 0.7142857142857143;
const DEFAULT_THUMBNAIL_HEIGHT = DEFAULT_THUMBNAIL_WIDTH / RATIO;

export class DocumentProcessingService {
  private readonly io: Server;
  private readonly poppler: ReturnType<typeof PopplerService>;
  private readonly imageResize: ImageResizeService;
  private readonly pageAlignment: PageAlignmentService;

  constructor(io: Server) {
    this.io = io;
    this.poppler = PopplerService();
    this.imageResize = new ImageResizeService(DEFAULT_THUMBNAIL_WIDTH, DEFAULT_THUMBNAIL_HEIGHT);
    this.pageAlignment = new PageAlignmentService(DEFAULT_THUMBNAIL_WIDTH, DEFAULT_THUMBNAIL_HEIGHT);
  }

  private async createWordObj(
    positionOnPage: number,
    text: string,
    width: number,
    height: number,
    top: number,
    left: number,
    pageId: number,
  ) {
    return {
      positionOnPage,
      text,
      width,
      height,
      top,
      left,
      pageId,
    };
  }

  private async savePageWordsFromXML(boundingBoxJson: any, newPage: Page) {
    let positionOnPage = 1;
    const words = [];
    const srcWords = boundingBoxJson.html.body.doc.page.word;
    if (!srcWords) {
      return;
    }

    if (srcWords.length) {
      for (const xmlWord of boundingBoxJson.html.body.doc.page.word) {
        if (
          xmlWord['#text'] &&
          xmlWord['#text'].length &&
          xmlWord['#text'].replace(SEARCHSTRING_CLEANUP, '').length
        ) {
          words.push(
            await this.createWordObj(
              positionOnPage,
              xmlWord['#text'],
              (xmlWord._xMax - xmlWord._xMin) / newPage.pageWidth,
              (xmlWord._yMax - xmlWord._yMin) / newPage.pageHeight,
              xmlWord._yMin / newPage.pageHeight,
              xmlWord._xMin / newPage.pageWidth,
              newPage.id,
            ),
          );
          positionOnPage += 1;
        }
      }
    } else {
      const xmlWord = srcWords;
      if (
        xmlWord['#text'] &&
        xmlWord['#text'].length &&
        xmlWord['#text'].replace(SEARCHSTRING_CLEANUP, '').length
      ) {
        words.push(
          await this.createWordObj(
            positionOnPage,
            xmlWord['#text'],
            (xmlWord._xMax - xmlWord._xMin) / (newPage.pageWidth * 0.95),
            (xmlWord._yMax - xmlWord._yMin) / newPage.pageHeight,
            xmlWord._yMin / newPage.pageHeight,
            xmlWord._xMin / (newPage.pageWidth * 0.95),
            newPage.id,
          ),
        );
      }
    }
    await PageWord.bulkCreate(words);
  }

  private async savePageWordsFromOCR(ocrBlocks: Tesseract.Block[], newPage: Page) {
    let positionOnPage = 1;
    const words = [];
    for (const block of ocrBlocks) {
      for (const paragraph of block.paragraphs) {
        for (const line of paragraph.lines) {
          for (const word of line.words) {
            words.push({
              positionOnPage: positionOnPage,
              text: word.text,
              width: (word.bbox.x1 - word.bbox.x0) / newPage.width,
              height: (word.bbox.y1 - word.bbox.y0) / newPage.height,
              top: word.bbox.y0 / newPage.height,
              left: word.bbox.x0 / newPage.width,
              pageId: newPage.id,
            });
            positionOnPage += 1;
          }
        }
      }
    }
    await PageWord.bulkCreate(words);
  }

  public async processPage(
    newDocument: Document,
    thumbFolder: string,
    file: Express.Multer.File,
    pageNumber: number,
    totalPages: number,
    password?: string,
  ): Promise<{ processedBy: string }> {
    appLogger('process page ' + pageNumber);
    let imageFilePath = `${thumbFolder}/${file.filename}`;

    await this.poppler.createImage(newDocument.filePath, imageFilePath, pageNumber, password);

    const imageFileNameExtension = `-${String(pageNumber).padStart(
      totalPages.toString().length,
      '0',
    )}.jpg`;
    imageFilePath = `${imageFilePath}${imageFileNameExtension}`;
    appLogger('created thumbnail for page ' + pageNumber);

    const dimensions = imagesSize(imageFilePath);

    const reducedFilePathMatch = imageFilePath.match(/store\S+/) || [];
    const imageURL = '/' + reducedFilePathMatch[0]?.replace(/\\/g, '/');
    const thumbnailURL = imageURL.replace('.jpg', '_thumb.jpg');

    await this.imageResize.resizeImage(imageFilePath, imageFilePath.replace('.jpg', '_thumb.jpg'));

    const pageOffset = this.pageAlignment.calculateOffsets(
      dimensions.width || 0,
      dimensions.height || 0,
    );

    const newPage = await Page.create({
      fileName: `${file.filename}${imageFileNameExtension}`,
      filePath: imageFilePath.replace(`/${file.filename}${imageFileNameExtension}`, ''),
      thumbnail: thumbnailURL,
      image: imageURL,
      pageNumber: pageNumber,
      bookmarked: false,
      width: dimensions.width,
      height: dimensions.height,
      documentId: newDocument.id,
      thumbnailScale: pageOffset?.scale,
      thumbnailPaddingX: pageOffset?.xPadding,
      thumbnailPaddingY: pageOffset?.yPadding,
    });

    appLogger('created page object for page ' + pageNumber);
    appLogger('extracting text of page ' + pageNumber);
    
    let textContent = await this.poppler.extractText(newDocument.filePath, pageNumber, password);
    let processedBy: string;

    if (textContent === '') {
      appLogger('no text found on page  ' + pageNumber);
      appLogger('initializing OCR');

      const ocr = await OCRService();
      appLogger('ocr ready');
      const data = await ocr.processPage(path.join(newPage.filePath, '/', newPage.fileName));
      textContent = data.text;
      if (data.blocks) {
        await this.savePageWordsFromOCR(data.blocks, newPage);
      }
      processedBy = 'ocr';
      appLogger('ocr of page ' + pageNumber + ' done');
      await ocr.terminate();
    } else {
      appLogger('extracting bound box data of page ' + pageNumber);
      const boundingBoxXML: any = await this.poppler.extractBoundingBoxXML(
        newDocument.filePath,
        pageNumber,
        password,
      );

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '_',
      });

      const boundingBoxJson = parser.parse(boundingBoxXML);
      appLogger('parsed XML of page ' + pageNumber);
      processedBy = 'poppler';

      await newPage.update({
        pageWidth: boundingBoxJson.html.body.doc.page._width,
        pageHeight: boundingBoxJson.html.body.doc.page._height,
      });

      await this.savePageWordsFromXML(boundingBoxJson, newPage);
    }

    await newPage.update({
      content: textContent,
    });

    this.io.emit('processingDocument', {
      documentId: newDocument.id,
      name: file.originalname,
      percentCompleted: pageNumber / totalPages,
      lastPageProcessed: pageNumber,
      totalPages: totalPages,
    });

    return { processedBy };
  }
}
