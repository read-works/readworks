import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Server, Socket } from 'socket.io';
import { CaseInterface } from '../interfaces/CaseInterface';
import { DocumentInterface } from '../interfaces/DocumentInterface';
import { FileService } from '../service/FileService';
import { PageInterface } from '../interfaces/PageInterface';

const namespace = '/document/';

export const DocumentController = async (
  app: Express,
  io: Server,
  clientSockets: Record<string, Socket>,
) => {
  const Document = DocumentInterface(io);
  const Cases = CaseInterface(io);
  const upload = multer({
    dest: path.join(process.env.READWORKS_PROJECT || __dirname + '/../', 'rwxdata', 'import'),
  });

  app.post(namespace, upload.single('file'), async (req: Request, res: Response) => {
    const workingCase = await Cases.readById(req.body.caseId);

    if (workingCase && req.file) {
      const fileService = new FileService();
      const targetFolder = fileService.getTargetFolder(workingCase);

      try {
        const clientSocket = clientSockets[req.sessionID];
        const result = await Document.create(req.body, req.file, targetFolder, clientSocket);
        res.send(result);
      } catch (error: any) {
        res.send({ error: error.message, description: req.file.originalname });
      }
    } else {
      res.send('');
    }
  });

  app.get(namespace, async (req: Request, res: Response) => {
    res.send(await Document.readAll());
  });

  app.get(`${namespace}:id`, async (req: Request, res: Response) => {
    res.send(await Document.readById(req.params.id));
  });

  app.get(`${namespace}:id/pages`, async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.id.toString(), 10);
    let fromPageNumber = 0;
    let loadNext;
    if (req.query.fromPageNumber) {
      fromPageNumber = parseInt(req.query.fromPageNumber.toString(), 10);
      if (Number.isNaN(fromPageNumber)) {
        fromPageNumber = 0;
      }
    }
    if (req.query.loadNext) {
      loadNext = parseInt(req.query.loadNext.toString(), 10);
      if (Number.isNaN(loadNext)) {
        loadNext = -1;
      }
    }

    if (req.query.filter && req.query.matchWord) {
      const ids = req.query.filter.toString().split(',').map(Number).sort();
      const matchWord = req.query.matchWord.toString();

      res.send(
        await PageInterface().readByDocumentId(
          documentId,
          [
            'content',
            'createdAt',
            'updatedAt',
            'filePath',
            'fileName',
            'pageWidth',
            'pageHeight',
            'deletionDate',
          ],
          ids,
          undefined,
          fromPageNumber,
          loadNext,
          matchWord,
        ),
      );
    } else if (req.query.filter && req.query.operator && !req.query.matchWord) {
      const ids = req.query.filter.toString().split(',').map(Number).sort();
      const andFilter = req.query.operator == 'and';

      res.send(
        await PageInterface().readByDocumentId(
          documentId,
          [
            'content',
            'createdAt',
            'updatedAt',
            'filePath',
            'fileName',
            'pageWidth',
            'pageHeight',
            'deletionDate',
          ],
          ids,
          andFilter,
          fromPageNumber,
          loadNext,
        ),
      );
    } else {
      res.send(
        await PageInterface().readByDocumentId(
          documentId,
          [
            'content',
            'createdAt',
            'updatedAt',
            'filePath',
            'fileName',
            'pageWidth',
            'pageHeight',
            'deletionDate',
          ],
          undefined,
          undefined,
          fromPageNumber,
          loadNext,
        ),
      );
    }
  });

  app.get(`${namespace}:id/pages/:pageId`, async (req: Request, res: Response) => {
    const pageId = parseInt(req.params.pageId, 10);
    const documentId = parseInt(req.params.id);

    res.send(
      await PageInterface().readByDocumentIdAndPageId(documentId, pageId, [
        'content',
        'deletionDate',
      ]),
    );
  });

  app.delete(`${namespace}:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await Document.remove(id);
    res.send({});
  });
};
