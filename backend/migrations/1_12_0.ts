import { DataTypes } from 'sequelize';
import type { Migration } from '../service/MigrationService';
import { appLogger } from '../helpers/app-logger';
import { announceTransformation } from '../helpers/announce-transformation';
import { MigrationMetaData } from '../../domain/interfaces';
import { broadcastStatusUpdate } from '../transformers/helpers/status-update';

//TODO test what happens when the process ends while this up method is still running?
// is the migration marked as successful?
// if not does adding a Column replace an existing one with content
export const up: Migration = async ({ context: sequelize }) => {
  const jobStore: MigrationMetaData = { percentCompleted: 0.001, output: '' };

  appLogger('running db migration 1.12.0');

  await sequelize.getQueryInterface().addColumn('Pages', 'image', DataTypes.STRING);
  await sequelize.getQueryInterface().addColumn('Pages', 'thumbnailScale', DataTypes.FLOAT);
  await sequelize.getQueryInterface().addColumn('Pages', 'thumbnailPaddingX', DataTypes.FLOAT);
  await sequelize.getQueryInterface().addColumn('Pages', 'thumbnailPaddingY', DataTypes.FLOAT);
  jobStore.percentCompleted = 0.1;
  jobStore.output += 'updating`';
  broadcastStatusUpdate(jobStore);
  announceTransformation('transform-1.12.0');
};

export const down: Migration = async ({ context: sequelize }) => {
  appLogger('down!');
  await sequelize.getQueryInterface().dropTable('testUsers');
};
