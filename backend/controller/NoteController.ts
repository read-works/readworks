import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import { NoteInterface } from '../interfaces/NoteInterface';

const namespace = '/note/';

export const NoteController = async (app: Express, io: Server) => {
  const Model = NoteInterface(io);

  // CREATE
  app.post(`${namespace}`, async (req: Request, res: Response) => {
    const result = await Model.create(req.body as any);
    res.send(result);
  });

  // UPDATE
  app.post(`${namespace}:noteId`, async (req: Request, res: Response) => {
    const noteId = parseInt(req.params.noteId, 10);
    if (!noteId) {
      res.send({});
    }
    res.send(await Model.updateNote(noteId, req.body));
  });

  app.get(`${namespace}page/:pageId`, async (req: Request, res: Response) => {
    const pageId = parseInt(req.params.pageId);
    if (req.query.filter) {
      const matchingIds = await Model.filterPageNotes(req.query.filter.toString(), pageId);
      res.send(await Model.getPageNotes(pageId, matchingIds));
    } else {
      res.send(await Model.getPageNotes(pageId));
    }
  });

  app.get('/notes/:caseId', async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (req.query.filter) {
      const matchingIds = await Model.filterCaseNotes(req.query.filter.toString(), caseId);
      res.send(await Model.getAllDocumentsWithNotes(caseId, matchingIds));
    } else {
      res.send(await Model.getAllDocumentsWithNotes(caseId));
    }
  });

  app.delete(`${namespace}:noteId`, async (req: Request, res: Response) => {
    const noteId = parseInt(req.params.noteId, 10);
    await Model.delete(noteId);
    res.send('');
  });

  app.post(`${namespace}order/:pageId`, async (req: Request, res: Response) => {
    //TODO set custom order for notes on a page
  });
};
