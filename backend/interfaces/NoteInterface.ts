import sequelize from 'sequelize';
import { Server } from 'socket.io';
import { CaseNote } from '../models/CaseNote';
import { Document } from '../models/Document';
import { DocumentNote } from '../models/DocumentNote';
import { Note } from '../models/Note';
import { Page } from '../models/Page';
import { PageNote } from '../models/PageNote';
import { SearchResultNote } from '../models/SearchResultNote';
import { WordNote } from '../models/WordNote';
import { PageInterface } from './PageInterface';

enum NoteType {
  Case = 'case',
  Document = 'document',
  Page = 'page',
  Word = 'word',
  SearchMatch = 'searchMatch',
}

export const NoteInterface = (io: Server) => {
  return {
    create: async (requestBody: any) => {
      if (!requestBody || !requestBody.foreignId || !requestBody.type) {
        return;
      }
      const note = await Note.create(requestBody);
      //TODO handle respondsTO and refersTo
      try {
        switch (requestBody.type) {
          case NoteType.Case:
            await CaseNote.create({ noteId: note.id, caseId: requestBody.foreignId });
            break;
          case NoteType.Document:
            await DocumentNote.create({ noteId: note.id, documentId: requestBody.foreignId });
            break;
          case NoteType.Page:
            // TODO handle coordinates
            await PageNote.create({ noteId: note.id, pageId: requestBody.foreignId });
            break;
          case NoteType.Word:
            await WordNote.create({ noteId: note.id, wordId: requestBody.foreignId });
            break;
          case NoteType.SearchMatch:
            await SearchResultNote.create({ noteId: note.id, resultId: requestBody.foreignId });
            break;
        }
      } catch (error: any) {
        if (error.SequelizeForeignKeyConstraintError) {
          note.destroy({ force: true });
        }
        return;
      }
      io.emit('update', {
        name: 'noteCreated',
        refetch: true,
      });
      return note;
    },
    setOrder: async (noteId: number, orderNumber: number) => {
      const note = await Note.findByPk(noteId);
      if (!note) {
        return;
      }
      note.order = orderNumber;
      return await note.save();
    },
    delete: async (noteId: number) => {
      const note = await Note.findByPk(noteId);
      if (!note) {
        return;
      }
      await note.destroy();

      io.emit('update', {
        name: 'noteDeleted',
        refetch: true,
      });
      return;
    },
    getCasetNotes: async (pageId: number) => {
      //TODO
    },
    getDocumentNotes: async (pageId: number) => {
      //TODO
    },
    getPageNotes: async (pageId: number, desiredIds?: number[]) => {
      if (!desiredIds) {
        return await Note.findAll({
          include: [
            {
              model: Page,
              attributes: [],
              required: true,
              through: { where: { pageId: pageId }, attributes: [] },
            },
          ],
          attributes: { exclude: ['deletionDate'] },
          order: [['updatedAt', 'DESC']],
        });
      } else {
        return await Note.findAll({
          include: [
            {
              model: Page,
              attributes: [],
              required: true,
              through: { where: { pageId: pageId }, attributes: [] },
            },
          ],
          attributes: { exclude: ['deletionDate'] },
          order: [['updatedAt', 'DESC']],
          where: { id: desiredIds },
        });
      }
    },

    updateNote: async (nodeId: number, data: any) => {
      const note = await Note.findByPk(nodeId);
      if (!note) {
        return;
      }
      note.content = data.content;
      io.emit('update', {
        name: 'noteUpdated',
        refetch: true,
      });
      return note.save();
    },

    getAllDocumentsWithNotes: async (caseId: number, desiredIds?: number[]) => {
      const pageInterface = PageInterface();
      let documents: any;
      if (desiredIds) {
        documents = await Document.findAll({
          //TODO refactor: there must be a "sequelize way" to do this
          order: [[sequelize.literal('`pages.notes.updatedAt`'), 'DESC']],
          where: { caseId: caseId },
          attributes: { exclude: ['deletionDate', 'processed', 'processedBy', 'caseId', 'md5'] },
          include: [
            {
              model: Page,
              required: true,
              attributes: [
                'id',
                ['image', 'thumbnail'],
                'width',
                'height',
                'bookmarked',
                'documentId',
                'pageNumber',
              ],
              include: [
                {
                  model: Note,
                  required: true,
                  through: { attributes: [] },
                  where: { id: desiredIds },
                  attributes: { exclude: ['deletionDate'] },
                },
              ],
            },
          ],
        });
      } else {
        documents = await Document.findAll({
          //TODO refactor: there must be a "sequelize way" to do this
          order: [[sequelize.literal('`pages.notes.updatedAt`'), 'DESC']],
          where: { caseId: caseId },
          attributes: { exclude: ['deletionDate', 'processed', 'processedBy', 'caseId', 'md5'] },
          include: [
            {
              model: Page,
              required: true,
              attributes: [
                'id',
                ['image', 'thumbnail'],
                'width',
                'height',
                'bookmarked',
                'documentId',
                'pageNumber',
              ],
              include: [
                {
                  model: Note,
                  required: true,
                  through: { attributes: [] },
                  attributes: { exclude: ['deletionDate'] },
                },
              ],
            },
          ],
        });
      }
      const documentsJSON = documents.map((doc: any) => doc.toJSON());
      for (const document of documentsJSON) {
        for (const page of document.pages) {
          page.searchMatches = await pageInterface.retrievePageSearchMatches(page.id);
          page.words = await pageInterface.retrievePageWords(page.id, true);
        }
      }
      return documentsJSON;
    },

    filterCaseNotes: async (query: string, caseId: number) => {
      /*let queryStr: string = `select Notes.id
                  from Notes, json_each(Notes.content -> '$.ops') as JSON_
                  join PageNotes on PageNotes.noteId = Notes.id
                  join Pages on PageNotes.pageId = Pages.id
                  join Documents on Pages.documentId = Documents.id
                  join Cases on Documents.caseId = ${caseId}
                  where JSON_.value -> '$.insert' not like '%image%' and lower(JSON_.value -> '$.insert') like '%${query}%';`;
                  const db = getDatabase();
                  const relevantIds = await db.query(queryStr, { raw: true, type: QueryTypes.SELECT });
                  if (!relevantIds) {
                    return;
                  }
                  return relevantIds.map((el: any) => el.id);
                  */
      const pageNotes = await Note.findAll({
        include: [
          {
            model: Page,
            required: true,
            include: [{ model: Document, where: { caseId: caseId } }],
          },
        ],
      });

      // TODO DUPLICATE CODE 1:1 NEEDS REFACTORING
      const relevantIds = [];
      for (const note of pageNotes) {
        const cnt = JSON.parse(JSON.stringify(note.content));
        for (const block of cnt.blocks) {
          // Text, Heading and quote
          if (block.data.text) {
            if (block.data.text.toLowerCase().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
            if (block.data.caption) {
              const txt = block.data.caption.toLowerCase();
              if (txt.toLowerCase().includes(query.toLowerCase())) {
                relevantIds.push(note.id);
              }
            }
            // Table
          } else if (block.data.content) {
            for (const row of block.data.content) {
              const txt = row.toString();
              if (txt.toLowerCase().includes(query.toLowerCase())) {
                relevantIds.push(note.id);
              }
            }
          }
          // Lists
          else if (block.data.items) {
            let txt;
            // checklist
            if (block.data.items[0].text) {
              txt = block.data.items.map((el: any) => el.text.toLowerCase());
            } else {
              txt = block.data.items;
            }
            if (txt.toString().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
          }
          // Code
          else if (block.data.code) {
            const txt = block.data.code.toLowerCase();
            if (txt.toString().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
          }
        }
      }
      return relevantIds;
    },

    filterPageNotes: async (query: string, pageId: number) => {
      const pageNotes = await Note.findAll({
        include: [{ model: Page, where: { id: pageId }, required: true }],
      });

      // TODO DUPLICATE CODE 1:1 NEEDS REFACTORING
      const relevantIds = [];
      for (const note of pageNotes) {
        const cnt = JSON.parse(JSON.stringify(note.content));
        for (const block of cnt.blocks) {
          // Text, Heading and quote
          if (block.data.text) {
            if (block.data.text.toLowerCase().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
            if (block.data.caption) {
              const txt = block.data.caption.toLowerCase();
              if (txt.toLowerCase().includes(query.toLowerCase())) {
                relevantIds.push(note.id);
              }
            }
            // Table
          } else if (block.data.content) {
            for (const row of block.data.content) {
              const txt = row.toString();
              if (txt.toLowerCase().includes(query.toLowerCase())) {
                relevantIds.push(note.id);
              }
            }
          }
          // Lists
          else if (block.data.items) {
            let txt;
            // checklist
            if (block.data.items[0].text) {
              txt = block.data.items.map((el: any) => el.text.toLowerCase());
            } else {
              txt = block.data.items;
            }
            if (txt.toString().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
          }
          // Code
          else if (block.data.code) {
            const txt = block.data.code.toLowerCase();
            if (txt.toString().includes(query.toLowerCase())) {
              relevantIds.push(note.id);
            }
          }
        }
      }
      return relevantIds;
    },
  };
};
