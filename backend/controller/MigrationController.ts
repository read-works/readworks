import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import semver from 'semver/preload';
import process from 'process';
import { MigrationMetaData } from '../../domain/interfaces';
import { getNextTransformationTask } from '../helpers/announce-transformation';
import { SequelizeStorage, Umzug } from 'umzug';
import { getDatabase } from '../sequelize';
import { appLogger } from '../helpers/app-logger';

//////Never rename or remove version!!!!!///////////////////////////////////////////////////
//////It's replaced during compile process by real version number from backend/package.json/
////////////////////////////////////////////////////////////////////////////////////////////
export let appVersion = 'MAJOR.MINOR.HOTFIX'; //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

if (appVersion === 'MAJOR.MINOR.HOTFIX') {
  appVersion = JSON.parse(readFileSync('package.json', 'utf-8')).version;
}

const namespace = '/migration/';

export const MigrationController = async (app: Express, io: Server) => {
  let versionFile;

  const migrationMetaData: MigrationMetaData = {
    percentCompleted: 0,
    output: 'Preparing migration...\n',
  };

  // Development default se
  if (process.env.READWORKS_DATA_DIR) {
    versionFile = process.env.READWORKS_DATA_DIR + '/version.txt';
  } else {
    versionFile = join(__dirname + '/../') + 'version.txt';
  }

  if (!existsSync(versionFile)) {
    await writeFile(versionFile, appVersion, 'utf-8');
  }

  const versionFileContent = await readFile(versionFile, 'utf-8');

  // Update version file if compatible
  if (
    semver.major(versionFileContent) === semver.major(appVersion) &&
    semver.minor(versionFileContent) === semver.minor(appVersion) &&
    semver.patch(appVersion) > semver.patch(versionFileContent)
  ) {
    // TODO This MUST happen as well after a successful migration
    await writeFile(versionFile, appVersion, 'utf-8');
  }

  // This is the bridge to establish messaging from:
  // transformer via electron > backend > via socket to frontend

  //@ts-expect-error not part of std node end (only electron)
  if (!!process.parentPort) {
    //@ts-expect-error not part of std node end (only electron)
    process.parentPort.on('message', (msg) => {
      if (msg.data.message === 'statusUpdateTransformer') {
        migrationMetaData.output += msg.data.payload.output ? msg.data.payload.output + '\n' : '\n';
        migrationMetaData.percentCompleted = msg.data.payload.percentCompleted;

        io.emit('migrationMetaData', migrationMetaData);
      }
    });
  }

  // Whatever is the cause it'll be started from here (db / file system inconsistency to current version)
  app.post(namespace, async (req: Request, res: Response) => {
    res.send();

    if (!process.env.READWORKS_APP_ROOT) {
      appLogger('READWORKS_APP_ROOT not specified. Migration not possible (Migration Controller)');
      return;
    }

    const sequelize = getDatabase();
    const migrator = new Umzug({
      migrations: {
        glob: ['migrations/*.js', { cwd: process.env.READWORKS_APP_ROOT }],
      },
      context: sequelize,
      storage: new SequelizeStorage({
        sequelize,
      }),
      logger: console,
    });

    appLogger('before up call to : ' + appVersion);

    try {
      await migrator.up({ to: appVersion.replaceAll('.', '_') + '.js' });
    } catch (err: any) {
      appLogger(err.message.includes("Couldn't find migration to apply with name"));
    }
    appLogger('after up call to : ' + appVersion);

    //
    //@ts-expect-error not part of std node end (only electron)
    if (!!process.parentPort) {
      io.emit('migrationMetaData', {
        percentCompleted: 0.001,
        output: migrationMetaData.output,
      } as MigrationMetaData);
      appLogger('in migrations');
      // Now the (correct) database migration must be triggered
      // DatabaseVersionComparison
      // 1.11.32  (project version)
      // 1.12.32  execute migrations in correct order, after each do transform  or next db migration until db is ???
      // 1.14.84  execute migrations in correct order, after each do transform  or next db migration until db is 1.17.56???
      // 1.17.56  (installed version)

      // I assume yet that db migration has control on the necessity to decide if a storage migration is required.
      // If it's required then announceTransformation('transform-1.11.20'); is registered (not executed yet) which
      // writes into the queue.json within the project.

      //
      // That's it maybe... as there's now the question of how we want handle the good "play together" to get everything back
      // into sync, even if the running app version is plenty of versions ahead to the opened project.
      //

      // However once there's a decision towards a model following call is mandatory to tell electron to run the
      // registered transformers
      // Crash Scenario
      // Database upgrade went successful but during migration a crash happened. The job transform-1.11.20 has
      // not been denounced and so calling following "runTransformers" post message ensures that electron can take care
      // for the execution.

      // As the migration is started always manually (by confirming migration button), even after crash & restart the
      // backend is started, the ui locked, and once the migration process is started the ui gets status updates.

      //Status updates will come back from here via ipc "statusUpdateTransformer" and be forwarded via
      // websocket to the still blocked ui until progress reached 100%.

      // Then a 100% user can restart the app.

      appLogger('send transformer run signal');
      //@ts-expect-error not part of std node end (only electron)
      process.parentPort.postMessage({
        event: 'runTransformers',
      });
    }
  });

  app.get(namespace, async (req: Request, res: Response) => {
    const isOutdatedVersion = semver.gt(versionFileContent, appVersion); // Update is offered for download then
    const isSameVersion = semver.eq(versionFileContent, appVersion);

    let isMajorUpdate = false;
    let isMinorUpdate = false;
    let projectFolderVersion;

    if (process.env.READWORKS_PROJECT_FILE && !isOutdatedVersion) {
      projectFolderVersion =
        (await readFile(process.env.READWORKS_PROJECT_FILE, 'utf-8')) ?? appVersion;

      isMajorUpdate = semver.major(projectFolderVersion) < semver.major(appVersion);
      isMinorUpdate = semver.minor(projectFolderVersion) < semver.minor(appVersion);

      // Just a hotfix update
      await writeFile(versionFile, appVersion, 'utf-8');

      if (isMajorUpdate || isMinorUpdate) {
      }
    }

    const hasTransformationTask = getNextTransformationTask();

    res.send({
      migrationRequired: isMajorUpdate || isMinorUpdate || hasTransformationTask,
      isOutdatedVersion: isOutdatedVersion,
      isSameVersion: isSameVersion,
      appVersion: appVersion,
      databaseVersion: projectFolderVersion ?? versionFileContent,
    });
  });

  app.get(`${namespace}version`, async (req: Request, res: Response) => {
    if (appVersion === '0.0.0') {
      res.send(JSON.parse(readFileSync('package.json', 'utf-8')));
    } else {
      res.send(appVersion);
    }
  });
};
