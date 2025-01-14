import { Server, Socket } from 'socket.io';
import { Document } from '../models/Document';
import sequelize, { Op, Order } from 'sequelize';
import { SearchResult } from '../models/SearchResult';
import { Search } from '../models/Search';
import { PageWord } from '../models/PageWord';
import { CaseInterface } from './CaseInterface';
import path from 'path';
import { Page } from '../models/Page';
import { FileService } from '../service/FileService';
import { QueueService } from '../service/QueueService';

export interface SearchAndSortSettings {
  searchForName?: string;
  sortDirection: 'asc' | 'desc';
  sortByType: 'date' | 'name';
}

const DEFAULT_SORT_DIRECTION = 'desc';
const DEFAULT_SORT_TYPE = 'date';

// Export these constants for use in PageInterface
export const DEFAULT_THUMBNAIL_WIDTH = 610;
const RATIO = 0.7142857142857143;
export const DEFAULT_THUMBNAIL_HEIGHT = DEFAULT_THUMBNAIL_WIDTH / RATIO;

export const DocumentInterface = (io: Server) => {
  const fileService = new FileService();
  const queueService = new QueueService(io);

  const caseFileExistsForCase = async (caseId: number, hash: string) => {
    return Document.findOne({
      where: {
        caseId: caseId,
        md5: hash,
      },
    });
  };

  const formatSearchResults = (documents: any[]) => {
    const seenDocumentMap = new Map<number, number>();
    for (let i = 0; i < documents.length; i++) {
      if (seenDocumentMap.has(documents[i].id)) {
        const originIndex = seenDocumentMap.get(documents[i].id) || 0;
        if (documents[i].query) {
          documents[originIndex].searchMatches.push({
            id: documents[i].searchId,
            query: documents[i].query,
            color: documents[i].color,
            documentMatchCount: documents[i].documentMatchCount,
          });
        }
      } else {
        documents[i].searchMatches = [];
        if (documents[i].query) {
          documents[i].searchMatches.push({
            id: documents[i].searchId,
            query: documents[i].query,
            color: documents[i].color,
            documentMatchCount: documents[i].documentMatchCount,
          });
        }
        delete documents[i].searchId;
        delete documents[i].query;
        delete documents[i].color;
        delete documents[i].documentMatchCount;
        seenDocumentMap.set(documents[i].id, i);
      }
    }
    return documents.filter((el: any) => el.searchMatches);
  };

  return {
    create: async (
      requestBody: any,
      file: Express.Multer.File,
      workingDir: string,
      clientSocket?: Socket,
    ) => {
      const caseInterface = CaseInterface(io);
      const caseId = parseInt(requestBody.caseId, 10);
      const sourceFile = file.path;
      const targetFile = path.join(workingDir, '/', file.filename);
      const thumbFolder = path.join(workingDir, '/', 'thumbnails', '/', file.filename);

      const fileHash = await fileService.calculateFileHash(sourceFile);
      const fileExists = await caseFileExistsForCase(caseId, fileHash);

      if (fileExists) {
        await fileService.removeDocument(fileExists, fileService.getTmpFolder());
        throw new Error('FILE_FOR_CASE_EXISTS');
      }

      await fileService.createThumbnailDirectory(thumbFolder);
      await fileService.copyFileToTarget(sourceFile, targetFile);

      const document = {
        originalName: Buffer.from(file.originalname, 'latin1').toString('utf-8'),
        filePath: targetFile,
        pageCount: 0,
        md5: fileHash,
        fileSize: file.size,
        processed: false,
        caseId: caseId,
      };

      const newDocument = await Document.create(document);

      queueService.addToQueue({
        newDocument,
        thumbFolder,
        file,
        clientSocket,
      });

      await caseInterface.updateById(requestBody.caseId);
      return newDocument;
    },

    readAll: async () => {
      return await Document.findAll();
    },

    readById: async (id: string) => {
      let documents: any = await Document.findAll({
        include: [
          {
            model: SearchResult,
            attributes: [],
            include: [
              { model: Search, attributes: [] },
              {
                model: PageWord,
                attributes: [],
                required: true,
                through: { attributes: [], where: { isExcluded: false } },
              },
            ],
          },
        ],
        attributes: [
          'id',
          'originalName',
          'filepath',
          'pageCount',
          'uniformRatio',
          'processed',
          'fileSize',
          'md5',
          'createdAt',
          'updatedAt',
          'caseId',
          'results.searchId',
          'results.search.query',
          'results.search.color',
          [sequelize.fn('count', sequelize.col('results.search.id')), 'documentMatchCount'],
        ],
        where: { id: parseInt(id, 10) },
        group: ['document.id', 'results.search.id'],
        order: [[sequelize.literal('results.searchId'), 'DESC']],
        raw: true,
      });

      documents = formatSearchResults(documents);
      return documents[0];
    },

    readPagesById: async (id: string) => {
      return await Document.findOne({
        include: [Page],
        where: { id: parseInt(id, 10) },
      });
    },

    readByCaseId: async (caseId: string, searchAndSortSettings: SearchAndSortSettings) => {
      const searchForName = searchAndSortSettings.searchForName;
      const sortByField =
        searchAndSortSettings.sortByType === DEFAULT_SORT_TYPE ? 'createdAt' : 'originalName';
      const sortDirection =
        searchAndSortSettings.sortDirection === DEFAULT_SORT_DIRECTION ? 'DESC' : 'ASC';

      let orderConfiguration: Order = [
        [sortByField, sortDirection],
        ['documentMatchCount', 'DESC'],
      ];

      if (sortByField === 'originalName') {
        orderConfiguration = [
          [sequelize.fn('lower', sequelize.col('originalName')), sortDirection],
        ];
      }

      const where: any = {
        caseId: parseInt(caseId, 10),
      };

      if (searchForName?.length) {
        where.originalName = { [Op.substring]: searchForName };
      }

      let documents: any = await Document.findAll({
        include: [
          {
            model: SearchResult,
            attributes: ['searchId'],
            include: [
              { model: Search, attributes: [] },
              {
                model: PageWord,
                attributes: [],
                required: true,
                through: { attributes: [], where: { isExcluded: false } },
              },
            ],
          },
        ],
        attributes: [
          'id',
          'originalName',
          'pageCount',
          'createdAt',
          'processed',
          'caseId',
          'results.searchId',
          'results.search.query',
          'results.search.color',
          [sequelize.fn('count', sequelize.col('results.search.id')), 'documentMatchCount'],
        ],
        where: where,
        group: ['document.id', 'results.search.id'],
        order: orderConfiguration,
        raw: true,
      });

      return formatSearchResults(documents);
    },

    remove: async (id: number) => {
      const document = await Document.findOne({ where: { id } });
      if (document) {
        await fileService.removeDocument(document, fileService.getTmpFolder());
        await document.destroy();
        io.emit('documentDeleted-' + id);
        io.emit('update', {
          name: 'documentDestroyed',
          refetch: true,
        });
      }
    },

    resetSequence: async () => {
      await Document.sequelize?.query(
        "UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'Documents';",
      );
    },
  };
};
