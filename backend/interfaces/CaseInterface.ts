import { mkdir } from 'fs/promises';
import { QueryTypes } from 'sequelize';
import { Server } from 'socket.io';
import { Case } from '../models/Case';
import { Document } from '../models/Document';
import { Search } from '../models/Search';
import { getDatabase } from '../sequelize';
import { CaseNote } from '../models/CaseNote';
import { DocumentNote } from '../models/DocumentNote';
import { Page } from '../models/Page';
import { PageNote } from '../models/PageNote';
import { PageWord } from '../models/PageWord';
import { SearchResult } from '../models/SearchResult';
import { SearchResultNote } from '../models/SearchResultNote';
import { WordNote } from '../models/WordNote';
import { syncWorkerFolder } from '../setup';
import { SEARCHSTRING_CLEANUP } from '../helpers/regex-patterns';
import { PageInterface } from './PageInterface';

import { FileService } from '../service/FileService';

export type HandledCaseCreationError = 'CASE_ALREADY_EXISTS';

export const CaseInterface = (io: Server) => {
  const pageInterface = PageInterface();

  const readById = async (id: string) => {
    return await Case.findOne({
      where: { id: parseInt(id, 10) },
    });
  };

  const emitCasesHaveChanged = () => {
    setTimeout(() => {
      io.emit('casesHaveChanged');
    }, 250);
  };

  return {
    create: async (requestBody: any) => {
      let newCase;
      try {
        newCase = await Case.create(requestBody);
      } catch (error: any) {
        let errorMsg: HandledCaseCreationError;

        switch (error.name) {
          case 'SequelizeUniqueConstraintError':
          default:
            errorMsg = 'CASE_ALREADY_EXISTS';
        }

        return { error: errorMsg, description: requestBody.title };
      }
      const fileService = new FileService();
      const targetFolder = fileService.getTargetFolder(newCase);

      await mkdir(targetFolder);
      await mkdir(targetFolder + '/thumbnails');
      await mkdir(targetFolder + '/text');

      syncWorkerFolder();

      emitCasesHaveChanged();

      return newCase;
    },

    readAll: async () => {
      return await Case.findAll({ order: [['updatedAt', 'DESC']] });
    },

    readById: async (id: string) => {
      return await readById(id);
    },

    updateById: async (id: string) => {
      const case_ = await readById(id);
      if (!case_) {
        return;
      }
      case_.changed('updatedAt', true);
      await case_.update({ updatedAt: new Date() });
    },

    readDocumentsById: async (id: string) => {
      return await Case.findOne({
        include: [Document],
        where: { id: parseInt(id, 10) },
      });
    },

    readDocumentsContainingText: async (caseId: number, searchId: number, wordText: string) => {
      let pageWordIds: number[] = [];
      let pageIds = [];

      const allResultWords = await PageWord.findAll({
        include: [
          {
            model: SearchResult,
            required: true,
            include: [{ model: Search, where: { id: searchId, caseId: caseId }, required: true }],
          },
        ],
        attributes: ['id', 'text', 'pageId'],
        raw: true,
      });

      const searchedText = wordText.replace(SEARCHSTRING_CLEANUP, '');
      for (const word of allResultWords) {
        if (word.text.replace(SEARCHSTRING_CLEANUP, '') === wordText) {
          pageWordIds.push(word.id);
          pageIds.push(word.pageId);
        }
      }

      const pages = await Page.findAll({
        where: { id: pageIds },
        order: [['pageNumber', 'ASC']],
        include: [
          {
            model: SearchResult,
            required: true,
            attributes: ['id'],
            include: [
              {
                model: Search,
                required: true,
                attributes: ['id', 'query', 'color'],
              },
              {
                model: PageWord,
                attributes: ['id', 'top', 'left', 'text', 'width', 'height'],
                required: true,
                where: { id: pageWordIds },
                through: { attributes: ['isExcluded', 'resultId'], where: { isExcluded: false } },
              },
            ],
          },
        ],
        attributes: {
          exclude: [
            'content',
            'createdAt',
            'updatedAt',
            'filePath',
            'fileName',
            'pageWidth',
            'pageHeight',
            'deletionDate',
          ],
        },
        subQuery: false,
      });

      const relevantPagesJSON = await pageInterface.reformatPageJSON(pages, false);
      return pageInterface.processPageData(relevantPagesJSON);
    },

    readDocumentContainingText: async (documentId: number, searchId: number, wordText: string) => {
      let pageWordIds: number[] = [];
      let pageIds = [];

      const allResultWords = await PageWord.findAll({
        include: [
          {
            model: SearchResult,
            required: true,
            where: { documentId: documentId },
            include: [{ model: Search, where: { id: searchId }, required: true }],
          },
        ],
        attributes: ['id', 'text', 'pageId'],
        raw: true,
      });
      searchId;
      const searchedText = wordText.replace(SEARCHSTRING_CLEANUP, '');
      for (const word of allResultWords) {
        if (word.text.replace(SEARCHSTRING_CLEANUP, '') === wordText) {
          pageWordIds.push(word.id);
          pageIds.push(word.pageId);
        }
      }

      const pages = await Page.findAll({
        where: { id: pageIds },
        order: [['pageNumber', 'ASC']],
        include: [
          {
            model: SearchResult,
            required: true,
            attributes: ['id'],
            include: [
              {
                model: Search,
                required: true,
                attributes: ['id', 'query', 'color'],
              },
              {
                model: PageWord,
                attributes: ['id', 'top', 'left', 'text', 'width', 'height'],
                required: true,
                where: { id: pageWordIds },
                through: { attributes: ['isExcluded', 'resultId'], where: { isExcluded: false } },
              },
            ],
          },
        ],
        attributes: {
          exclude: [
            'content',
            'createdAt',
            'updatedAt',
            'filePath',
            'fileName',
            'pageWidth',
            'pageHeight',
            'deletionDate',
          ],
        },
        subQuery: false,
      });

      const relevantPagesJSON = await pageInterface.reformatPageJSON(pages, false);
      return pageInterface.processPageData(relevantPagesJSON);
    },

    readSearchesById: async (id: string) => {
      return await Case.findOne({
        include: [Search],
        where: { id: parseInt(id, 10) },
      });
    },

    remove: async (id: string) => {
      const caseId = parseInt(id, 10);
      const caseToDelete = await Case.findOne({
        where: { id: caseId },
      });
      if (!caseToDelete) {
        return;
      }

      io.emit('caseToDelete-' + caseToDelete.id);

      const fileService = new FileService();
      const targetFolder = fileService.getTargetFolder(caseToDelete);
      await fileService.moveAndRemove(targetFolder);

      const caseNoteIds: any = [
        ...(await CaseNote.findAll({
          where: { caseId: caseId },
          attributes: ['noteId'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.noteId);

      const searchIds: any = [
        ...(await Search.findAll({
          where: { caseId: caseId },
          paranoid: false,
          attributes: ['id'],
          raw: true,
        })),
      ].map((el: any) => el.id);

      const searchResultIds: any = [
        ...(await SearchResult.findAll({
          where: { searchId: searchIds },
          paranoid: false,
          attributes: ['id'],
          raw: true,
        })),
      ].map((el: any) => el.id);

      const searchResultNoteIds: any = [
        ...(await SearchResultNote.findAll({
          where: { resultId: searchResultIds },
          paranoid: false,
          attributes: ['noteId'],
          raw: true,
        })),
      ].map((el: any) => el.noteId);

      const documentIds: any = [
        ...(await Document.findAll({
          where: { caseId: caseId },
          attributes: ['id'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.id);

      const documentNoteIds: any = [
        ...(await DocumentNote.findAll({
          where: { documentId: documentIds },
          attributes: ['noteId'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.noteId);

      const pageIds: any = [
        ...(await Page.findAll({
          where: { documentId: documentIds },
          attributes: ['id'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.id);

      const wordIds: any = [
        ...(await PageWord.findAll({
          where: { pageId: pageIds },
          attributes: ['id'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.id);

      const pageNoteIds: any = [
        ...(await PageNote.findAll({
          where: { pageId: pageIds },
          attributes: ['noteId'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.noteId);

      const wordNoteIds = [
        ...(await WordNote.findAll({
          where: { wordId: wordIds },
          attributes: ['noteId'],
          paranoid: false,
          raw: true,
        })),
      ].map((el: any) => el.noteId);

      const allNoteIds = [
        ...caseNoteIds,
        ...documentNoteIds,
        ...pageNoteIds,
        ...wordNoteIds,
        ...searchResultIds,
      ];
      const db = getDatabase();
      await db.query('PRAGMA secure_delete=0;');
      await db.query('PRAGMA FOREIGN_KEYS=0;');

      await db.query('DELETE FROM PageWords WHERE pageId IN(:pageIds)', {
        replacements: { pageIds: pageIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM SearchResultWords WHERE wordId IN(:wordIds)', {
        replacements: { wordIds: wordIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM SearchResultNotes WHERE noteId IN(:noteIds)', {
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM WordNotes WHERE noteId IN(:noteIds)', {
        replacements: { noteIds: wordNoteIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM PageNotes WHERE noteId IN(:noteIds)', {
        replacements: { noteIds: pageNoteIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM DocumentNotes WHERE noteId IN(:noteIds)', {
        replacements: { noteIds: documentNoteIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM CaseNotes WHERE noteId IN(:noteIds)', {
        replacements: { noteIds: caseNoteIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM Notes WHERE id IN(:noteIds)', {
        replacements: { noteIds: allNoteIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM SearchResults WHERE id IN(:searchResultIds)', {
        replacements: { searchResultIds: searchResultIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM Searches WHERE id IN(:searchIds)', {
        replacements: { searchIds: searchIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM Pages WHERE documentId IN(:documentIds)', {
        replacements: { documentIds: documentIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM Documents WHERE id IN(:documentIds)', {
        replacements: { documentIds: documentIds },
        type: QueryTypes.DELETE,
      });

      await db.query('DELETE FROM Cases WHERE id IN(:caseId)', {
        replacements: { caseId: caseId },
        type: QueryTypes.DELETE,
      });

      await db.query('PRAGMA foreign_keys=1;');
      await db.query('VACUUM;');
      await db.query('REINDEX;');

      emitCasesHaveChanged();

      syncWorkerFolder();

      return true;
    },
    resetSequence: async () => {
      await Case.sequelize?.query("UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'Cases';");
    },
  };
};
