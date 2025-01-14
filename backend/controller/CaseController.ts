import { Express, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import { CaseInterface } from '../interfaces/CaseInterface';
import { DocumentInterface, SearchAndSortSettings } from '../interfaces/DocumentInterface';
import { SearchInterface } from '../interfaces/SearchInterface';

const DEFAULT_SORT_DIRECTION = 'desc';
const DEFAULT_SORT_TYPE = 'date';

const namespace = '/case/';

export const CaseController = async (
  app: Express,
  io: Server,
  clientSockets: Record<string, Socket>,
) => {
  const Case = CaseInterface(io);
  const Document = DocumentInterface(io);
  const Search = SearchInterface(io);

  app.post(namespace, async (req: Request, res: Response) => {
    const result = await Case.create(req.body);
    res.send(result);
  });

  app.get(namespace, async (req: Request, res: Response) => {
    res.send(await Case.readAll());
  });

  app.get(`${namespace}:id`, async (req: Request, res: Response) => {
    const caseItem = await Case.readById(req.params.id);
    res.send(caseItem);
  });

  app.get(`${namespace}:id/documents`, async (req: Request, res: Response) => {
    const searchAndSortSettings: SearchAndSortSettings = {
      searchForName: req.query.name ? req.query.name.toString() : undefined,
      sortByType: req.query.sortBy ? (req.query.sortBy.toString() as any) : DEFAULT_SORT_TYPE,
      sortDirection: req.query.direction
        ? (req.query.direction.toString() as any)
        : DEFAULT_SORT_DIRECTION,
    };

    const documents = await Document.readByCaseId(req.params.id, searchAndSortSettings);

    res.send(documents);
  });

  app.get(`${namespace}:id/documents/:searchId/:wordText`, async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.id, 10);
    const searchId = parseInt(req.params.searchId, 10);
    const wordText = req.params.wordText;

    const documents = await Case.readDocumentsContainingText(caseId, searchId, wordText);

    res.send(documents);
  });

  app.get(
    `${namespace}:id/pages/:documentId/:searchId/:wordText`,
    async (req: Request, res: Response) => {
      const caseId = parseInt(req.params.id, 10);
      const documentId = parseInt(req.params.documentId, 10);
      const searchId = parseInt(req.params.searchId, 10);
      const wordText = req.params.wordText;
      let documents;

      if (documentId === 0) {
        documents = await Case.readDocumentsContainingText(caseId, searchId, wordText);
      } else {
        documents = await Case.readDocumentContainingText(documentId, searchId, wordText);
      }
      res.send(documents);
    },
  );

  app.get(`${namespace}:id/searches`, async (req: Request, res: Response) => {
    const orderParam = req.query.order ? req.query.order.toString() : undefined;
    const searches = await Search.readByCaseId(req.params.id, orderParam);
    res.send(searches);
  });
  app.put(`${namespace}:id`, (req: Request, res: Response) => {});

  app.delete(`${namespace}:id`, async (req: Request, res: Response) => {
    await Case.remove(req.params.id);
    res.send({});
  });
};
