import dotenv from 'dotenv';
import dotenvParseVariables, { Parsed } from 'dotenv-parse-variables';
import express, { Express, Request, Response } from 'express';

import { existsSync } from 'fs';
import * as http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { CaseController } from './controller/CaseController';
import { DocumentController } from './controller/DocumentController';
import { MigrationController } from './controller/MigrationController';
import { NoteController } from './controller/NoteController';
import { PageController } from './controller/PageController';
import { SearchController } from './controller/SearchController';
import { getSettings, SettingsController } from './controller/SettingsController';
import { checkRequiresMigration } from './helpers/migration';
import { Case } from './models/Case';
import { getDatabase } from './sequelize';
import { CleanUpService } from './service/CleanUpService';
import { autoImportWorker, setup } from './setup';
import session from 'express-session';
import { Document } from './models/Document';
import { Page } from './models/Page';
import { Search } from './models/Search';
import { SearchResult } from './models/SearchResult';
import { PageWord } from './models/PageWord';
import { SearchResultWords } from './models/SearchResultWords';
import { Note } from './models/Note';
import { CaseNote } from './models/CaseNote';
import { DocumentNote } from './models/DocumentNote';
import { PageNote } from './models/PageNote';
import { WordNote } from './models/WordNote';
import { SearchResultNote } from './models/SearchResultNote';
import { appLogger } from './helpers/app-logger';
import { DependencyController } from './controller/DependencyController';
import { LwmController } from './controller/LwmController';

export const isDevMode = () => {
  return existsSync(path.join(__dirname, 'extlib'));
};
export const isElectronDebugMode = () => {
  return !isProductionMode() && !isDevMode();
};
export const isProductionMode = () => {
  return __dirname.includes('app.asar');
};
export const getApplicationRoot = () => {
  if (process.env.READWORKS_APP_ROOT) {
    return process.env.READWORKS_APP_ROOT;
  } else if (isDevMode()) {
    return __dirname;
  } else if (isElectronDebugMode()) {
    return __dirname;
  } else if (isProductionMode()) {
    return __dirname;
  } else {
    return __dirname;
  }
};

if (existsSync(path.join(getApplicationRoot() + '/.env'))) {
  try {
    dotenv.config({ path: path.join(getApplicationRoot() + '/.env') });
    //@ts-ignore
    process.env = dotenvParseVariables(process.env as Parsed);
    process.env.READWORKS_APP_ROOT = getApplicationRoot();
  } catch (e) {
    appLogger('CANNOT_PROCESS_ENV_FILE');
  }
} else {
  // Here we could set environment vars to an electron default (???WINDOWS/MAC/LINUX DIFFERENCES)
  appLogger('CANNOT_FIND_ENV_FILE');
}

export const getExtLibDir = () => {
  // On mac __dirname is in asar (folder) level so to get to poppler, lwm etc ../ is the place to be
  // but in electron dev mode it's at ./
  // and in real dev mode at ./extlib/
  // and is it like that on any OS???
  return path.join(
    getApplicationRoot(),
    `${isDevMode() ? 'extlib' : getApplicationRoot().includes('app.asar') ? '../' : ''}`,
  );
};

setup();

(async () => {
  const app: Express = express();
  const port = parseInt(process.env.PORT || '1234', 10);

  app.set('trust proxy', 1);

  app.use(
    session({
      secret: 'readworks-ce',
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '25mb' }));
  app.use(express.static(path.join(getApplicationRoot() + '/public')));
  app.use(
    '/store',
    express.static(
      path.join((process.env.READWORKS_PROJECT || getApplicationRoot()) + '/rwxdata/store'),
    ),
  );

  const server = http.createServer(app);
  const io: Server = new Server(server);
  const socketClientSessions: any = {};
  await SettingsController(app, io);
  await MigrationController(app, io);

  const cleanUpService = await CleanUpService(io);

  if (!checkRequiresMigration()) {
    const sequelize = getDatabase();

    sequelize.addModels([
      Case,
      Document,
      Page,
      Search,
      SearchResult,
      PageWord,
      SearchResultWords,
      Note,
      CaseNote,
      DocumentNote,
      PageNote,
      SearchResultNote,
      WordNote,
    ]);

    await sequelize.sync({});
    await CaseController(app, io, socketClientSessions);
    await DocumentController(app, io, socketClientSessions);
    await PageController(app, io);
    await SearchController(app, io);
    await NoteController(app, io);
    await LwmController(app, io);
    DependencyController(app, io);
    cleanUpService.run();

    io.on('connection', (socket) => {
      // console.log('a user connected');
      if (socket.handshake.headers.cookie) {
        const clientSocketIdentifier = socket.handshake.headers.cookie
          .replace('connect.sid=s%3A', '')
          .split('.')[0];

        socketClientSessions[clientSocketIdentifier] = socket;

        socket.on('disconnect', () => {
          //console.log('Destroy websocket for session: ', clientSocketIdentifier)
          delete socketClientSessions[clientSocketIdentifier];
          console.log('Currently ' + Object.keys(socketClientSessions).length + ' active sessions');
        });
      }
    });
  } else {
    appLogger(`Database migration required`, 'engine');
  }

  app.get('/de/*', (req: Request, res: Response) => {
    res.sendFile(path.join(getApplicationRoot() + '/public/de/index.html'));
  });

  app.get('/en/*', (req: Request, res: Response) => {
    res.sendFile(path.join(getApplicationRoot() + '/public/en/index.html'));
  });

  app.get('*', (req: Request, res: Response) => {
    res.redirect('/');
  });
  const settings = await getSettings();

  // This is working in production code so we're safe
  const hostName = settings.remote ? '0.0.0.0' : 'localhost';
  server.listen(port, hostName, async () => {
    console.log(`⚡️readworks.app started`);

    autoImportWorker(hostName, port);

    const hasProject = !!process.env.READWORKS_PROJECT;
    appLogger(process.env.READWORKS_PROJECT, `️started`);

    if (hasProject) {
      //@ts-ignore if electron is not imported this causes an checking error
      process.parentPort.postMessage({
        event: 'serviceReady',
        payload: { pid: process.pid },
      });
    }
  });
})();
