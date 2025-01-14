import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import { SearchInterface } from '../interfaces/SearchInterface';

const namespace = '/search/';

export const SearchController = async (app: Express, io: Server) => {
  const searchInterface = SearchInterface(io);

  app.post(namespace, async (req: Request, res: Response) => {
    res.send(await searchInterface.create(req.body));
  });

  app.get(namespace, async (req: Request, res: Response) => {
    res.send(await searchInterface.readAll());
  });

  app.get(`${namespace}:id`, async (req: Request, res: Response) => {
    res.send(await searchInterface.readById(req.params.id));
  });

  app.put(`${namespace}:id`, (_req: Request, _res: Response) => {});

  app.post(`${namespace}result/exclude`, async (req: Request, res: Response) => {
    await searchInterface.excludeSearchResultWord(
      req.body.wordId,
      req.body.resultId,
      req.body.isExcluded,
    );
    res.send(true);
  });

  app.post(`${namespace}result/exclude-word`, async (req: Request, res: Response) => {
    await searchInterface.excludeAllWordsFromSearchResult(
      req.body.wordId,
      req.body.text,
      req.body.resultId,
      req.body.searchId,
    );
    res.send(true);
  });

  app.post(`${namespace}result/include-word`, async (req: Request, res: Response) => {
    await searchInterface.includeWordsInSearchResult(
      req.body.text,
      req.body.searchId,
      req.body.documentId,
      req.body.forCase,
    );
    res.send(true);
  });

  app.post(`${namespace}result/apply-filter`, async (req: Request, res: Response) => {
    await searchInterface.applyFilter(
      req.body.words,
      req.body.searchId,
      req.body.documentId,
      req.body.forCase,
      req.body.filterIsSetToInclude,
    );
    res.send(true);
  });

  app.post(`${namespace}result/preview/`, async (req: Request, res: Response) => {
    res.send(
      await searchInterface.previewPageSearch(req.body.caseId, req.body.pageId, req.body.query),
    );
  });

  app.get(
    `${namespace}:searchId/result-count/case/:caseId`,
    async (req: Request, res: Response) => {
      const data = await searchInterface.countCaseResultOccurences(
        parseInt(req.params.searchId.toString(), 10),
        parseInt(req.params.caseId.toString(), 10),
      );
      res.send(data);
    },
  );

  app.get(
    `${namespace}:searchId/result-count/document/:documentId`,
    async (req: Request, res: Response) => {
      const data = await searchInterface.countDocumentResultOccurences(
        parseInt(req.params.searchId.toString(), 10),
        parseInt(req.params.documentId.toString(), 10),
      );
      res.send(data);
    },
  );

  app.get(
    `${namespace}:searchId/result-count/page/:pageId`,
    async (req: Request, res: Response) => {
      const data = await searchInterface.countPageResultOccurences(
        parseInt(req.params.searchId.toString(), 10),
        parseInt(req.params.pageId.toString(), 10),
      );
      res.send(data);
    },
  );

  app.delete(`${namespace}:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await searchInterface.remove(id);

    res.send({});
  });
};
