import { Express, Request, Response } from 'express';
import { PageInterface } from '../interfaces/PageInterface';
import { Server } from 'socket.io';

const namespace = '/page/';

export const PageController = async (app: Express, io: Server) => {
  const Model = PageInterface();

  app.post(`${namespace}bookmarks`, async (req: Request, res: Response) => {
    const result = await Model.bookmark(req.body as any);
    io.emit('updateBookmarks');
    res.send(result);
  });

  app.get(`${namespace}bookmarks/:caseId/:documentId`, async (req: Request, res: Response) => {
    const result = await Model.readBookmarks(
      parseInt(req.params.caseId, 10),
      parseInt(req.params.documentId, 10),
    );

    res.send(result);
  });
};
