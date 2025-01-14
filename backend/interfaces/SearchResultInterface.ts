import { SearchResult } from '../models/SearchResult';

export const SearchResultInterface = () => {
  return {
    create: async (data: any) => {
      return await SearchResult.create(data);
    },

    ignore: async (id: string) => {
      const result = await SearchResult.findOne({
        where: { id: parseInt(id, 10) },
      });
      result?.set('ignore', true);
      result?.save();
    },

    readAll: async () => {
      return await SearchResult.findAll();
    },

    readById: async (id: string) => {
      return await SearchResult.findOne({
        where: { id: parseInt(id, 10) },
      });
    },

    readBySearchId: async (searchId: string) => {
      return await SearchResult.findAll({
        where: { searchId: parseInt(searchId, 10) },
      });
    },

    readByPageId: async (pageId: string) => {
      return await SearchResult.findAll({
        where: { pageId: parseInt(pageId, 10) },
      });
    },

    readByPageIdAndSearchId: async (pageId: number, searchId: number) => {
      return await SearchResult.findOne({
        where: { pageId: pageId, searchId: searchId },
      });
    },

    remove: async (id: string) => {
      return await SearchResult.destroy({ where: { id: parseInt(id, 10) } });
    },

    resetSequence: async () => {
      await SearchResult.sequelize?.query(
        "UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'Results';",
      );
    },
  };
};
