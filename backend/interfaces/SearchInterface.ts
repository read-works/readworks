import { createHash } from 'crypto';
import sequelize from 'sequelize';
import { Server } from 'socket.io';
import { PageWord } from '../models/PageWord';
import { Search } from '../models/Search';
import { Document } from '../models/Document';
import { SearchResult } from '../models/SearchResult';
import { SearchResultWords } from '../models/SearchResultWords';
import { SearchService } from '../service/SearchService';
import { CaseInterface } from './CaseInterface';
import { SEARCHSTRING_CLEANUP } from '../helpers/regex-patterns';

export type HandledSearchtermError = 'SEARCH_ALREADY_EXISTS';

export const SearchInterface = (io: Server) => {
  const regrougCleanedTexts = async (rawGroups: [any]) => {
    const groups = [];
    const searchToIndex: Record<string, number> = {};

    for (let i = 0; i < rawGroups.length; i++) {
      const rawObj = rawGroups[i];
      const cleanedText = rawObj.text.replace(SEARCHSTRING_CLEANUP, '');
      if (searchToIndex[cleanedText] === undefined) {
        groups.push({ text: cleanedText, count: 0 });
        searchToIndex[cleanedText] = groups.length - 1;
      }
      groups[searchToIndex[cleanedText]].count += rawObj.count;
    }
    return groups.sort((a: any, b: any) => {
      if (a.count < b.count) {
        return 1;
      }
      if (b.count < a.count) {
        return -1;
      }
      return 0;
    });
  };

  return {
    create: async (requestBody: any) => {
      const caseInterface = CaseInterface(io);
      try {
        const sha256 = createHash('sha256');
        const md5 = createHash('md5');

        const hash = md5
          .update(requestBody.query.toLowerCase().replace(SEARCHSTRING_CLEANUP, ''))
          .digest('hex');

        requestBody.color = `${hash[2]}${hash[3]}${hash[4]}${hash[5]}${hash[6]}${hash[7]}`;

        requestBody.queryHash = sha256
          .update(requestBody.query.toLowerCase() + requestBody.caseId)
          .digest('hex');

        const search = await Search.create(requestBody);
        await caseInterface.updateById(requestBody.caseId);

        // Decouple search processing from persisting (the frontend then responds faster again)
        setTimeout(async () => {
          const searchService = await SearchService(search.caseId.toString(), io);
          await searchService.newSearchQuery(search);

          io.emit('update', {
            name: 'searchCreated',
            refetch: true,
          });
        }, 0);

        return search;
      } catch (error: any) {
        let errorMsg: HandledSearchtermError;

        switch (error.name) {
          case 'SequelizeUniqueConstraintError':
          default:
            errorMsg = 'SEARCH_ALREADY_EXISTS';
        }

        return { error: errorMsg, description: requestBody.query };
      }
    },

    readAll: async () => {
      return await Search.findAll();
    },

    readById: async (id: string) => {
      return await Search.findOne({
        where: { id: parseInt(id, 10) },
      });
    },

    readByCaseId: async (caseId: string, orderParam?: string) => {
      if (
        !(orderParam?.toLocaleLowerCase() === 'asc') &&
        !(orderParam?.toLocaleLowerCase() === 'desc')
      ) {
        orderParam = 'asc';
      }
      return await Search.findAll({
        include: [
          {
            model: SearchResult,
            // required: true,
            attributes: [],
            include: [
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
          'query',
          'color',
          'processing',
          [sequelize.fn('count', sequelize.col('results.id')), 'foundCount'],
          [
            sequelize.fn('count', sequelize.fn('distinct', sequelize.col('results.documentId'))),
            'documentCount',
          ],
          [
            sequelize.fn('count', sequelize.fn('distinct', sequelize.col('results.pageId'))),
            'pageCount',
          ],
        ],
        group: ['search.id', 'search.query'],
        where: { caseId: parseInt(caseId, 10) },
        order: [['id', orderParam]],
        raw: true,
      });
    },

    remove: async (id: number) => {
      const remove = await Search.destroy({ where: { id: id }, force: true });
      await SearchResult.destroy({ where: { searchId: id } });

      io.emit('update', {
        name: 'searchDeleted',
        refetch: true,
      });

      return remove;
    },

    excludeAllWordsFromSearchResult: async (
      wordId?: number,
      text?: string,
      resultId?: number,
      searchId?: number,
    ) => {
      const wordIds: number[] = [];
      if (!text) {
        const wordToExclude = await PageWord.findByPk(wordId);
        text = wordToExclude?.text;
      }
      if (!searchId) {
        const search = await SearchResult.findByPk(resultId);
        searchId = search?.searchId;
      }
      if (!text || !searchId) {
        return;
      }

      const allResultWords:any = await PageWord.findAll({
        include: [
          {
            model: SearchResult,
            required: true,
            include: [{ model: Search, where: { id: searchId }, required: true }],
          },
        ],
        attributes: [
          'id',
          'text',
          [sequelize.col('results.SearchResultWords.resultId'), 'resultId']
        ],
        raw: true,
      });

      const wordText = text.replace(SEARCHSTRING_CLEANUP, '');
      for (const word of allResultWords) {
        if (word.text.replace(SEARCHSTRING_CLEANUP, '') === wordText) {
          await SearchResultWords.update(
            { isExcluded: true },
            {
              where: {
                wordId: word.id,
                resultId: word.resultId
              },
            },
          );
        }
      }


      io.emit('update', {
        name: 'searchResultExcluded',
        refetch: true,
      });
    },

    includeWordsInSearchResult: async (
      words: string[],
      searchId: number,
      documentId: number,
      forCase: boolean,
    ) => {

      const allResultWords:any = forCase
        ? await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                include: [{ model: Search, where: { id: searchId }, required: true }],
              },
            ],
            attributes: [
              'id',
              'text',
              [sequelize.col('results.SearchResultWords.resultId'), 'resultId']
            ],
            raw: true,
          })
        : await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                where: { documentId: documentId },
                include: [{ model: Search, where: { id: searchId }, required: true }],
              },
            ],
            attributes: [
              'id',
              'text',
              [sequelize.col('results.SearchResultWords.resultId'), 'resultId']
            ],
            raw: true,
          });
      words = words.map((word) => {
        return word.replace(SEARCHSTRING_CLEANUP, '');
      });
      for (const word of allResultWords) {
        if (!words.includes(word.text.replace(SEARCHSTRING_CLEANUP, ''))) {

      await SearchResultWords.update(
        { isExcluded: true },
        {
          where: {
            wordId: word.id,
            resultId: word.resultId
          },
        },
      );
        }
      }


      io.emit('update', {
        name: 'searchResultExcluded',
        refetch: true,
      });
    },
    excludeWordsFromSearchResult: async (
      words: string[],
      searchId: number,
      documentId: number,
      forCase: boolean,
    ) => {

      const allResultWords:any = forCase
        ? await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                include: [{ model: Search, where: { id: searchId }, required: true }],
              },
            ],
            attributes: [
              'id',
              'text',
              [sequelize.col('results.SearchResultWords.resultId'), 'resultId']
            ],
            raw: true,
          })
        : await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                where: { documentId: documentId },
                include: [{ model: Search, where: { id: searchId }, required: true }],
              },
            ],
            attributes: [
              'id',
              'text',
              [sequelize.col('results.SearchResultWords.resultId'), 'resultId']
            ],
            raw: true,
          });
      words = words.map((word) => {
        return word.replace(SEARCHSTRING_CLEANUP, '');
      });
      for (const word of allResultWords) {
        if (words.includes(word.text.replace(SEARCHSTRING_CLEANUP, ''))) {
              await SearchResultWords.update(
                { isExcluded: true },
                {
                  where: {
                    wordId: word.id,
                    resultId: word.resultId
                  },
                },
              );
            }
          }



      io.emit('update', {
        name: 'searchResultExcluded',
        refetch: true,
      });
    },
    applyFilter: async (
      words: string[],
      searchId: number,
      documentId: number,
      forCase: boolean,
      filterIsSetToInclude: boolean,
    ) => {
      if (filterIsSetToInclude) {
        await SearchInterface(io).includeWordsInSearchResult(words, searchId, documentId, forCase);
      } else {
        await SearchInterface(io).excludeWordsFromSearchResult(
          words,
          searchId,
          documentId,
          forCase,
        );
      }
    },
    excludeSearchResultWord: async (
      wordId: number,
      resultId: number,
      isExcluded: boolean,
      reloadUserInterface = true,
    ) => {
      await SearchResultWords.update(
        { isExcluded: isExcluded },
        {
          where: {
            wordId: wordId,
            resultId: resultId,
          },
        },
      );
      if (reloadUserInterface) {
        io.emit('update', {
          name: 'searchResultExcluded',
          refetch: true,
        });
      }
    },
    previewPageSearch: async (caseId: number, pageId: number, query: string) => {
      const searchService = await SearchService(caseId.toString(), io);
      return searchService.previewPageSearch(pageId, query);
    },
    resetSequence: async () => {
      await Search.sequelize?.query(
        "UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'Searches';",
      );
    },

    countCaseResultOccurences: async (searchId: number, caseId: number) => {
      const rawGroups: any = await SearchResult.findAll({
        where: { searchId: searchId },
        include: [
          {
            model: PageWord,
            attributes: [],
            required: true,
            through: { attributes: [], where: { isExcluded: false } },
          },
          { model: Document, attributes: [], required: true, where: { caseId: caseId } },
        ],
        attributes: [
          'words.text',
          [sequelize.fn('count', 'words.id'), 'count'],
          [sequelize.col('words->SearchResultWords.resultId'), 'resultId']
        ],
        raw: true,
        group: ['words.text'],
        order: [['count', 'DESC']],
      });
      return regrougCleanedTexts(rawGroups);
    },
    countDocumentResultOccurences: async (searchId: number, documentId: number) => {
      const rawGroups: any = await SearchResult.findAll({
        where: { searchId: searchId, documentId: documentId },
        include: [
          {
            model: PageWord,
            attributes: [],
            required: true,
            through: { attributes: [], where: { isExcluded: false } },
          },
        ],
        attributes: [
          'words.text',
          [sequelize.fn('count', 'words.id'), 'count'],
          [sequelize.col('words->SearchResultWords.resultId'), 'resultId']
        ],
        raw: true,
        group: ['words.text'],
        order: [['count', 'DESC']],
      });
      return regrougCleanedTexts(rawGroups);
    },
    countPageResultOccurences: async (searchId: number, pageId: number) => {
      const rawGroups: any = await SearchResult.findAll({
        where: { searchId: searchId, pageId: pageId },
        include: [
          {
            model: PageWord,
            attributes: [],
            required: true,
            through: { attributes: [], where: { isExcluded: false } },
          },
        ],
        attributes: ['words.text', [sequelize.fn('count', 'words.id'), 'count']],
        raw: true,
        group: ['words.text'],
        order: [['count', 'DESC']],
      });
      return regrougCleanedTexts(rawGroups);
    },
  };
};
