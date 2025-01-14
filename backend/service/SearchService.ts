import sequelize from 'sequelize';
import { Server } from 'socket.io';
import { CaseInterface } from '../interfaces/CaseInterface';
import { SearchResultInterface } from '../interfaces/SearchResultInterface';
import { SearchInterface } from '../interfaces/SearchInterface';
import { Case } from '../models/Case';
import { Document } from '../models/Document';
import { Page } from '../models/Page';
import { PageWord } from '../models/PageWord';
import { Search } from '../models/Search';
import { SearchResultWords } from '../models/SearchResultWords';
import { FuzzySearch } from './search/FuzzySearch';
import { SearchResult } from '../models/SearchResult';
import { PartialMatchSearch } from './search/PartialMatchSearch';

export interface WindowWord {
  documentId: number;
  pageId: number;
  wordId: number;
  positionOnPage: number;
  wordText: string;
}

export const SearchService = async (caseId: string, io: Server) => {
  const caseInterface = CaseInterface(io);
  const Result = SearchResultInterface();

  const searchByPage = async (search: Search, wordsInCase: WindowWord[]) => {
    // separate pages and perform search
    let wordsOnPage: WindowWord[] = [];
    let previousWordsPageId;
    for (const [index, word] of wordsInCase.entries()) {
      if (previousWordsPageId) {
        if (word.pageId == previousWordsPageId) {
          wordsOnPage.push(word);
        } else {
          await performSearch(search, wordsOnPage);
          wordsOnPage = [word];
        }
        if (index === wordsInCase.length - 1) {
          await performSearch(search, wordsOnPage);
        }
      } else {
        wordsOnPage.push(word);
      }
      previousWordsPageId = word.pageId;
    }
  };

  const performSearch = async (search: Search, words: WindowWord[]) => {
    const fuzzySearch = FuzzySearch();
    const partialMatchSearch = PartialMatchSearch();
    const windowSize = search.query.split(' ').length;
    let fuzzySearchResult;
    let partialMatchSearchResult;
    for (let index = 0; index < words.length; index++) {
      const currentWordWindow = words.slice(index, index + windowSize);
      const currentTextWindow = currentWordWindow.map((word) => word.wordText).join(' ');
      fuzzySearchResult = fuzzySearch.matchByJaroWinklerDistance(search.query, currentTextWindow);
      partialMatchSearchResult = partialMatchSearch.matchByPartial(search.query, currentTextWindow);
      if (fuzzySearchResult.match || partialMatchSearchResult.match) {
        await saveResult(search, currentWordWindow, fuzzySearchResult.score);
      }
    }
  };

  const performPreviewSearch = (query: string, words: WindowWord[]) => {
    const fuzzySearch = FuzzySearch();
    const partialMatchSearch = PartialMatchSearch();
    const matches: number[] = [];
    let searchResult;
    let partialMatchSearchResult;

    for (const word of words) {
      searchResult = fuzzySearch.matchByJaroWinklerDistance(query, word.wordText);
      partialMatchSearchResult = partialMatchSearch.matchByPartial(query, word.wordText);
      if (searchResult.match || partialMatchSearchResult.match) {
        matches.push(word.positionOnPage);
      }
    }
    return matches;
  };

  const saveResult = async (search: Search, currentWordWindow: WindowWord[], score: number) => {
    let result;
    try {
      result = await Result.create({
        ignore: false,
        occurrences: 0,
        score: score,
        documentId: currentWordWindow[0].documentId,
        pageId: currentWordWindow[0].pageId,
        searchId: search.id,
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        result = await Result.readByPageIdAndSearchId(currentWordWindow[0].pageId, search.id);
      }
    }
    for (const wordResult of currentWordWindow) {
      try {
        await SearchResultWords.create({
          resultId: result?.id,
          wordId: wordResult.wordId,
        });
      } catch (error: any) {
        //Result was already present
      }
    }
  };

  const excludeWordsFilteredByUser = async (search: Search, documentId: number) => {
    const filteredWordTextsOfSearch: any[] = await Search.findAll({
      include: [
        {
          model: SearchResult,
          required: true,
          paranoid: false,
          attributes: [],
          include: [
            {
              model: PageWord,
              required: true,
              paranoid: false,
              attributes: [],
              through: {
                paranoid: false,
                attributes: [],
                where: { isExcluded: true },
              },
            },
          ],
        },
      ],
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('results.words.text')), 'text']],
      raw: true,
      where: { id: search.id },
    });

    const resultWordsInDocument: any[] = await Search.findAll({
      include: [
        {
          model: SearchResult,
          attributes: [],
          required: true,
          include: [
            {
              model: PageWord,
              attributes: [],
              required: true,
              include: [
                {
                  model: Page,
                  where: { documentId: documentId },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        [sequelize.col('results.words.id'), 'wordId'],
        [sequelize.col('results.id'), 'resultId'],
        'results.words.text',
      ],
      raw: true,
    });

    if (!filteredWordTextsOfSearch || !resultWordsInDocument) {
      return;
    }
    const searchInterface = SearchInterface(io);
    for (const resultWord of resultWordsInDocument) {
      for (const filteredText of filteredWordTextsOfSearch) {
        if (filteredText.text === resultWord.text) {
          await searchInterface.excludeSearchResultWord(
            resultWord.wordId,
            resultWord.resultId,
            true,
            false,
          );
        }
      }
    }
  };

  return {
    newDocument: async (document: Document) => {
      const case_ = await caseInterface.readSearchesById(caseId);
      if (!case_) {
        return;
      }
      const searches = case_.searches || [];

      const wordsInDocument = (await Case.findAll({
        include: [
          {
            model: Document,
            attributes: [],
            where: { id: document.id },
            include: [
              {
                model: Page,
                attributes: [],
                include: [{ model: PageWord, attributes: [] }],
              },
            ],
          },
        ],
        where: { id: caseId },
        attributes: [
          [sequelize.literal('documents.id'), 'documentId'],
          [sequelize.literal('`documents->pages`.id'), 'pageId'],
          [sequelize.literal('`documents->pages->words`.id'), 'wordId'],
          [sequelize.literal('`documents->pages->words`.positionOnPage'), 'positionOnPage'],
          [sequelize.literal('`documents->pages->words`.text'), 'wordText'],
        ],
        order: [
          ['documentId', 'ASC'],
          ['pageId', 'ASC'],
          ['positionOnPage', 'ASC'],
        ],
        raw: true,
      })) as any as WindowWord[];

      for (const search of searches) {
        await search.update({ processing: true });
        await searchByPage(search, wordsInDocument);
        await excludeWordsFilteredByUser(search, document.id);
        io.emit('update', {
          name: search.query,
          searchProcessingPercentCompleted: 1,
          refetch: true,
        });
        await search.update({ processing: false });
      }
    },
    newSearchQuery: async (search: Search) => {
      await search.update({ processing: true });
      const wordsInCase = (await Case.findAll({
        include: [
          {
            model: Document,
            attributes: [],
            include: [
              {
                model: Page,
                attributes: [],
                include: [{ model: PageWord, attributes: [] }],
              },
            ],
            where: { processed: true },
          },
        ],
        where: { id: caseId },
        attributes: [
          [sequelize.literal('documents.id'), 'documentId'],
          [sequelize.literal('`documents->pages`.id'), 'pageId'],
          [sequelize.literal('`documents->pages->words`.id'), 'wordId'],
          [sequelize.literal('`documents->pages->words`.positionOnPage'), 'positionOnPage'],
          [sequelize.literal('`documents->pages->words`.text'), 'wordText'],
        ],
        order: [
          ['documentId', 'ASC'],
          ['pageId', 'ASC'],
          ['positionOnPage', 'ASC'],
        ],
        raw: true,
      })) as any as WindowWord[];

      await searchByPage(search, wordsInCase);
      io.emit('update', {
        name: search.query,
        searchProcessingPercentCompleted: 1,
        refetch: true,
      });
      await search.update({ processing: false });
    },
    previewPageSearch: async (pageId: number, query: string) => {
      const wordsOnPage = (await Case.findAll({
        include: [
          {
            model: Document,
            attributes: [],
            include: [
              {
                model: Page,
                attributes: [],
                where: { id: pageId },
                required: true,
                include: [{ model: PageWord, attributes: [] }],
              },
            ],
          },
        ],
        where: { id: caseId },
        attributes: [
          [sequelize.literal('documents.id'), 'documentId'],
          [sequelize.literal('`documents->pages`.id'), 'pageId'],
          [sequelize.literal('`documents->pages->words`.id'), 'wordId'],
          [sequelize.literal('`documents->pages->words`.positionOnPage'), 'positionOnPage'],
          [sequelize.literal('`documents->pages->words`.text'), 'wordText'],
        ],
        order: [
          ['documentId', 'ASC'],
          ['pageId', 'ASC'],
          ['positionOnPage', 'ASC'],
        ],
        raw: true,
      })) as any as WindowWord[];
      return performPreviewSearch(query, wordsOnPage);
    },
  };
};
