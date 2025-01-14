import { Umzug, SequelizeStorage } from 'umzug';
import { getDatabase } from '../sequelize';

const sequelize = getDatabase();

export const migrator = new Umzug({
  migrations: {
    glob: 'migrations/*.ts',
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
});

migrator.on('migrated', async (eventData) => {
  console.log(eventData);
});

export type Migration = typeof migrator._types.migration;
