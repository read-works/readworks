import { PageWord } from '../models/PageWord';

export const PageWordInterface = () => {
  // Interface that is exposed e.g. to the controller for CRUD operations
  return {
    create: async (requestBody: any) => {
      return await PageWord.create(requestBody);
    },

    readAll: async () => {
      return await PageWord.findAll({});
    },

    readById: async (id: string) => {
      return await PageWord.findOne({
        where: { id: parseInt(id, 10) },
      });
    },

    readByCaseId: async (documentId: string, andFilter: boolean = false) => {},

    readByDocumentId: async (documentId: string, andFilter: boolean = false) => {},

    readByPageId: async (pageId: string, excludeFields: string[] = []) => {},

    remove: async (id: string) => {
      return await PageWord.destroy({ where: { id: parseInt(id, 10) } });
    },

    resetSequence: async () => {
      await PageWord.sequelize?.query(
        "UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'Words';",
      );
    },
  };
};
