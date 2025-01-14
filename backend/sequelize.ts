import { Sequelize } from 'sequelize-typescript';
import process from 'process';

export const getDatabase = () => {
  const database =
    (process.env.READWORKS_PROJECT || '.') + '/rwxdata/' + (process.env.DB || 'database.sqlite');
  return new Sequelize({
    dialect: 'sqlite',
    database: 'document',
    benchmark: true,
    storage: database,
    logging: !!process.env.SQL_LOGGING || false,
  });
};
