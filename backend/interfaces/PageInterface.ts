import sequelize, { FindAttributeOptions, Op } from 'sequelize';
import { Document } from '../models/Document';
import { Page } from '../models/Page';
import { PageWord } from '../models/PageWord';
import { Search } from '../models/Search';
import { SearchResult } from '../models/SearchResult';
import { Note } from '../models/Note';
import { SEARCHSTRING_CLEANUP } from '../helpers/regex-patterns';
import { DEFAULT_THUMBNAIL_HEIGHT, DEFAULT_THUMBNAIL_WIDTH } from './DocumentInterface';

export const PageInterface = () => {
  const pageAttributes: FindAttributeOptions = [
    [sequelize.literal('document.id'), 'documentId'],
    [sequelize.literal('document.originalName'), 'originalName'],
    'id',
    'fileName',
    'filePath',
    'thumbnail',
    'image',
    'width',
    'height',
    'pageNumber',
    'bookmarked',
    'thumbnailScale',
    'thumbnailPaddingX',
    'thumbnailPaddingY',
  ];

  const processPageData: any = async (pages: any) => {
    const data: any = [];

    for (const page of pages) {
      if (data.length === 0) {
        data.push({
          documentName: page.originalName,
          documentId: page.documentId,
        });
        delete page.originalName;
        data[0].pages = [page];
        continue;
      }
      let pagePresent = false;
      for (const obj of data) {
        if (obj.documentId === page.documentId) {
          delete page.originalName;
          obj.pages.push(page);
          pagePresent = true;
          break;
        }
      }
      if (!pagePresent) {
        const newLength = data.push({
          documentName: page.originalName,
          documentId: page.documentId,
        });
        delete page.originalName;
        data[newLength - 1].pages = [page];
      }
    }

    return data;
  };

  const retrievePageSearchMatches = async (pageId: number) => {
    return await Document.findAll({
      include: [
        {
          model: SearchResult,
          attributes: [],
          where: { pageId: pageId },
          required: true,
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
        'results.search.id',
        'results.search.query',
        'results.search.color',
        //[sequelize.fn('count', sequelize.col('results.search.id')), 'documentMatchCount'],
      ],
      raw: true,
      order: [[sequelize.col('results.search.id'), 'DESC']],
      group: ['results.search.id'],
    });
  };

  const retrievePageSearchMatchesOfDocument = async (documentId: number) => {
    return await Document.findAll({
      where: { id: documentId },
      include: [
        {
          model: SearchResult,
          attributes: [],
          required: true,
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
        'results.pageId',
        'results.search.id',
        'results.search.query',
        'results.search.color',
        //[sequelize.fn('count', sequelize.col('results.search.id')), 'documentMatchCount'],
      ],
      raw: true,
      order: [[sequelize.col('results.search.id'), 'DESC']],
      group: ['results.pageId', 'results.search.id'],
    });
  };

  const retrievePageWords = async (pageId: number, onlySearchResultWords: boolean) => {
    const pageWords: any = await PageWord.findAll({
      include: [
        {
          model: SearchResult,
          required: onlySearchResultWords,
          through: { attributes: [] },
          attributes: [],
          include: [
            {
              model: Search,
              attributes: [],
            },
          ],
        },
      ],
      attributes: {
        include: ['id', 'top', 'left', 'text', 'width', 'height'],
      },
      where: {
        pageId: pageId,
      },
      group: ['PageWord.id'],
      order: [['id', 'ASC']],
      raw: true,
    });

    const pageSearchHits: any = await SearchResult.findAll({
      where: { pageId: pageId },
      include: [
        { model: Search, required: true, attributes: [] },
        { model: PageWord, attributes: [], through: { attributes: [] } },
      ],
      attributes: [
        [sequelize.col('words.id'), 'wordId'],
        [sequelize.col('search.id'), 'searchId'],
        [sequelize.col('search.color'), 'bgColor'],
        [sequelize.col('resultId'), 'resultId'],
        [sequelize.col('words.SearchResultWords.isExcluded'), 'isExcluded'],
        'score',
      ],
      raw: true,
      subQuery: false,
      order: [
        ['isExcluded', 'ASC'],
        ['score', 'DESC'],
      ],
    });
    for (const word of pageWords) {
      for (const hit of pageSearchHits) {
        if (word.id === hit.wordId) {
          word.searchId = hit.searchId;
          word.bgColor = hit.bgColor;
          word.resultId = hit.resultId;
          word.isExcluded = hit.isExcluded;
          break;
        }
      }
    }
    return pageWords;
  };

  const retrieveDocumentWords = async (documentId: number, onlySearchResultWords: boolean) => {
    return SearchResult.findAll({
      where: { documentId: documentId },
      include: [
        { model: PageWord, through: { attributes: [] }, required: true, attributes: [] },
        { model: Search, required: onlySearchResultWords, attributes: [] },
      ],
      attributes: [
        'pageId',
        [sequelize.col('words.id'), 'id'],
        [sequelize.col('words.top'), 'top'],
        [sequelize.col('words.left'), 'left'],
        [sequelize.col('words.text'), 'text'],
        [sequelize.col('words.width'), 'width'],
        [sequelize.col('words.height'), 'height'],
        'searchId',
        [sequelize.col('search.color'), 'bgColor'],
        ['id', 'resultId'],
        [sequelize.col('words.searchresultwords.isExcluded'), 'isExcluded'],
        'score',
      ],
      order: [
        ['id', 'ASC'],
        ['score', 'DESC'],
      ],
    });
  };

  const retrievePageNoteCount = async (pageId: number) => {
    return Note.count({
      include: [
        {
          model: Page,
          attributes: [],
          required: true,
          through: { where: { pageId: pageId }, attributes: [] },
        },
      ],
    });
  };

  const retrievePagesNoteCount = async () => {
    return Page.findAll({
      include: [{ model: Note, required: true, attributes: [], through: { attributes: [] } }],
      attributes: ['id', [sequelize.fn('count', sequelize.col('Page.id')), 'noteCount']],
      group: ['Page.id'],
      raw: true,
    });
  };

  const scaleWordCoordinates = (page: any, word: any) => {
    word.left =
      (word.left * page.width * page.thumbnailScale + page.thumbnailPaddingX) /
      DEFAULT_THUMBNAIL_WIDTH;
    word.top =
      (word.top * page.height * page.thumbnailScale + page.thumbnailPaddingY) /
      DEFAULT_THUMBNAIL_HEIGHT;
    word.width = (word.width * page.width * page.thumbnailScale) / DEFAULT_THUMBNAIL_WIDTH;
    word.height = (word.height * page.height * page.thumbnailScale) / DEFAULT_THUMBNAIL_HEIGHT;
    return word;
  };

  const reformatPageJSON = async (pages: Page[], bookmarks?: boolean) => {
    const data = [];
    for (const page of pages) {
      const pageJSON: any = page.toJSON();
      pageJSON.searchMatches = [];
      const words = [];
      for (const match of pageJSON.results) {
        pageJSON.searchMatches.push(match.search);
        for (let word of match.words) {
          word.bgColor = match.search.color;
          word.searchId = match.search.id;
          word.isExcluded = word.SearchResultWords.isExcluded;
          word.resultId = word.SearchResultWords.resultId;
          delete word.SearchResultWords;
          word = scaleWordCoordinates(pageJSON, word);
          words.push(word);
        }
      }
      delete pageJSON.results;
      pageJSON.words = words;
      if (bookmarks) {
        pageJSON.noteCount = await page.$count('notes');
      }
      data.push(pageJSON);
    }
    return data;
  };

  return {
    create: async (requestBody: any) => {
      return await Page.create(requestBody);
    },

    bookmark: async (requestBody: { pageId: number; bookmarked: boolean }) => {
      return Page.update(
        { bookmarked: requestBody.bookmarked },
        {
          where: {
            id: requestBody.pageId,
          },
        },
      );
    },

    readBookmarks: async (caseId: number, documentId: number) => {
      const data = { currentDocument: {}, caseDocuments: [{}] };

      const currentDocumentPages = await Page.findAll({
        where: {
          bookmarked: true,
          documentId: documentId,
        },
        order: [
          ['documentId', 'ASC'],
          ['pageNumber', 'ASC'],
          [sequelize.col('results.searchId'), 'DESC'],
        ],
        attributes: pageAttributes,
        include: [
          { model: Document, attributes: [] },
          {
            model: SearchResult,
            attributes: ['id'],
            include: [
              { model: Document, attributes: [] },

              { model: Search, attributes: ['id', 'query', 'color'] },
              {
                model: PageWord,
                attributes: ['id', 'top', 'left', 'text', 'width', 'height'],
                required: true,
                through: { attributes: ['isExcluded', 'resultId'], where: { isExcluded: false } },
              },
            ],
          },
        ],
      });

      const otherDocumentPages = await Page.findAll({
        where: {
          bookmarked: true,
          [Op.not]: [{ documentId: documentId }],
        },
        order: [
          ['documentId', 'ASC'],
          ['pageNumber', 'ASC'],
          [sequelize.col('results.searchId'), 'DESC'],
        ],
        attributes: pageAttributes,
        include: [
          { model: Document, attributes: [], where: { caseId: caseId }, required: true },
          {
            model: SearchResult,
            attributes: ['id'],
            include: [
              { model: Document, attributes: [] },

              { model: Search, attributes: ['id', 'query', 'color'] },
              {
                model: PageWord,
                attributes: ['id', 'top', 'left', 'text', 'width', 'height'],
                required: true,
                through: { attributes: ['isExcluded', 'resultId'], where: { isExcluded: false } },
              },
            ],
          },
        ],
      });

      const currentDocumentPagesJSON = await reformatPageJSON(currentDocumentPages, true);
      const otherDocumentPagesJSON = await reformatPageJSON(otherDocumentPages, true);
      for (const page of currentDocumentPagesJSON) {
        page.width = DEFAULT_THUMBNAIL_WIDTH;
        page.height = DEFAULT_THUMBNAIL_HEIGHT;
      }
      for (const page of otherDocumentPagesJSON) {
        page.width = DEFAULT_THUMBNAIL_WIDTH;
        page.height = DEFAULT_THUMBNAIL_HEIGHT;
      }

      const currentDocument = await processPageData(currentDocumentPagesJSON);
      data.currentDocument = currentDocument.pop();
      data.caseDocuments = await processPageData(otherDocumentPagesJSON);
      return data;
    },

    readAll: async () => {
      return await Page.findAll({
        order: [['pageNumber', 'ASC']],
      });
    },

    readById: async (id: string) => {
      return await Page.findOne({
        where: { id: parseInt(id, 10) },
      });
    },

    readByDocumentId: async (
      documentId: number,
      excludeFields: string[] = [],
      filterSearchIds: number[] = [],
      andFilter: boolean = false,
      fromPageNumber: number = 0,
      loadNext: number = 100,
      matchWord: string = '',
    ) => {
      let pages = undefined;
      if (documentId === 0) {
        if (filterSearchIds.length && matchWord) {
          const pageWordIds: number[] = [];
          const pageIds = [];

          const allResultWords = await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                include: [{ model: Search, where: { id: filterSearchIds }, required: true }],
              },
            ],
            attributes: ['id', 'text', 'pageId'],
            raw: true,
          });

          const searchedText = matchWord.replace(SEARCHSTRING_CLEANUP, '');
          for (const word of allResultWords) {
            if (word.text.replace(SEARCHSTRING_CLEANUP, '') === searchedText) {
              pageWordIds.push(word.id);
              pageIds.push(word.pageId);
            }
          }

          pages = await Page.findAll({
            where: { id: pageIds },
            order: [
              ['documentId', 'ASC'],
              ['pageNumber', 'ASC'],
            ],
            include: [
              { model: Document, attributes: [] },
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
                    through: {
                      attributes: ['isExcluded', 'resultId'],
                      where: { isExcluded: false },
                    },
                  },
                ],
              },
            ],
            attributes: pageAttributes,
            subQuery: false,
          });
        }
      } else {
        if (filterSearchIds.length && matchWord) {
          const pageWordIds: number[] = [];
          const pageIds = [];

          const allResultWords = await PageWord.findAll({
            include: [
              {
                model: SearchResult,
                required: true,
                include: [{ model: Search, where: { id: filterSearchIds }, required: true }],
              },
            ],
            attributes: ['id', 'text', 'pageId'],
            raw: true,
          });

          const searchedText = matchWord.replace(SEARCHSTRING_CLEANUP, '');
          for (const word of allResultWords) {
            if (word.text.replace(SEARCHSTRING_CLEANUP, '') === searchedText) {
              pageWordIds.push(word.id);
              pageIds.push(word.pageId);
            }
          }

          pages = await Page.findAll({
            where: { documentId: documentId, pageNumber: { [Op.gt]: fromPageNumber } },
            order: [
              ['documentId', 'DESC'],
              ['pageNumber', 'ASC'],
            ],
            include: [
              { model: Document, attributes: [] },
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
                    through: {
                      attributes: ['isExcluded', 'resultId'],
                      where: { isExcluded: false },
                    },
                  },
                ],
              },
            ],
            attributes: pageAttributes,
            subQuery: false,
          });
        } else if (filterSearchIds.length && !andFilter) {
          pages = await Page.findAll({
            where: {
              documentId: documentId,
              pageNumber: { [Op.gt]: fromPageNumber },
              '$results.search.id$': filterSearchIds,
            },
            order: [
              ['documentId', 'DESC'],
              ['pageNumber', 'ASC'],
            ],
            include: [
              { model: Document, attributes: [] },
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
                    through: {
                      attributes: ['isExcluded', 'resultId'],
                      where: { isExcluded: false },
                    },
                  },
                ],
              },
            ],
            attributes: pageAttributes,
            subQuery: false,
          });
        } else if (filterSearchIds.length && andFilter) {
          pages = await Page.findAll({
            where: {
              documentId: documentId,
              pageNumber: { [Op.gt]: fromPageNumber },
              '$results.search.id$': filterSearchIds,
            },
            order: [
              ['documentId', 'DESC'],
              ['pageNumber', 'ASC'],
            ],
            include: [
              { model: Document, attributes: [] },
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
                    through: {
                      attributes: ['isExcluded', 'resultId'],
                      where: { isExcluded: false },
                    },
                  },
                ],
              },
            ],
            attributes: pageAttributes,
            subQuery: false,
            group: ['page.id'],
            having: sequelize.where(
              sequelize.fn('count', sequelize.fn('distinct', sequelize.col('results.search.id'))),
              {
                [Op.eq]: filterSearchIds.length,
              },
            ),
          });
        } else {
          pages = await Page.findAll({
            where: { documentId: documentId, pageNumber: { [Op.gt]: fromPageNumber } },
            order: [
              ['documentId', 'DESC'],
              ['pageNumber', 'ASC'],
              [sequelize.literal('results.searchId'), 'DESC'],
            ],
            include: [
              { model: Document, attributes: [] },

              {
                model: SearchResult,
                attributes: ['id'],
                include: [
                  { model: Search, attributes: ['id', 'query', 'color'] },
                  {
                    model: PageWord,
                    attributes: ['id', 'top', 'left', 'text', 'width', 'height'],
                    required: true,
                    through: {
                      attributes: ['isExcluded', 'resultId'],
                      where: { isExcluded: false },
                    },
                  },
                ],
              },
            ],
            attributes: pageAttributes,
            subQuery: false,
          });
        }
      }

      if (!pages) {
        return;
      }

      if (loadNext != -1) {
        pages = pages.slice(0, loadNext);
      }

      if (!pages) {
        return;
      }
      const data = await reformatPageJSON(pages, false);
      const pagesNoteCount: any = await retrievePagesNoteCount();

      if (filterSearchIds.length && !matchWord) {
        const pagesSearchMatches: any = await retrievePageSearchMatchesOfDocument(documentId);
        const pagesSearchResultWords: any = await retrieveDocumentWords(documentId, true);

        for (const page of data) {
          page.searchMatches = [];
          page.words = [];

          for (const searchMatch of pagesSearchMatches) {
            if (page.id == searchMatch.pageId) {
              page.searchMatches.push(searchMatch);
            }
          }
          for (const word of pagesSearchResultWords) {
            if (page.id == word.pageId) {
              let wordJson = word.toJSON();
              wordJson = scaleWordCoordinates(page, wordJson);
              page.words.push(wordJson);
            }
          }
          for (const note of pagesNoteCount) {
            if (page.id == note.id) {
              page.noteCount = note.noteCount;
              break;
            }
          }
          page.width = DEFAULT_THUMBNAIL_WIDTH;
          page.height = DEFAULT_THUMBNAIL_HEIGHT;
        }
      } else {
        for (const page of data) {
          for (const note of pagesNoteCount) {
            if (page.id == note.id) {
              page.noteCount = note.noteCount;
              break;
            }
          }
          page.width = DEFAULT_THUMBNAIL_WIDTH;
          page.height = DEFAULT_THUMBNAIL_HEIGHT;
        }
      }

      return data;
    },

    readByDocumentIdAndPageId: async (
      documentId: number,
      pageId: number,
      excludeFields: string[] = [],
    ) => {
      const page: any = await Page.findOne({
        where: {
          id: pageId,
        },
        attributes: { exclude: excludeFields },
        raw: true,
      });
      if (!page) {
        return;
      }

      page.searchMatches = await retrievePageSearchMatches(pageId);
      page.words = await retrievePageWords(pageId, false);
      page.noteCount = await retrievePageNoteCount(pageId);
      return page;
    },

    remove: async (id: string) => {
      return await Page.destroy({ where: { id: parseInt(id, 10) } });
    },

    resetSequence: async () => {
      await Page.sequelize?.query("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'Pages';");
    },
    retrievePageSearchMatches: retrievePageSearchMatches,
    retrievePageWords: retrievePageWords,
    reformatPageJSON: reformatPageJSON,
    processPageData: processPageData,
  };
};
