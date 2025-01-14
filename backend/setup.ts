import { createReadStream, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { lstatSync, readdirSync } from 'node:fs';
import { rimraf } from 'rimraf';
import FormData from 'form-data';
import axios from 'axios';
import { appLogger } from './helpers/app-logger';

const storeFolderName = '/store/';
const workerFolderName = '/⚙-worker/';
const tmpFolderName = '/tmp/';
const uploadFolderName = '/import/';

export const setup = () => {
  let workingDir = __dirname;

  if (!!process.env.READWORKS_PROJECT) {
    workingDir = process.env.READWORKS_PROJECT;

    if (!existsSync(workingDir)) {
      mkdirSync(workingDir);
    }
  }

  const dataFolder = path.join(workingDir, 'rwxdata');

  const storeFolder = path.join(workingDir, 'rwxdata', storeFolderName);
  const workerFolder = path.join(workingDir, workerFolderName);
  const tmpFolder = path.join(workingDir, 'rwxdata', tmpFolderName);
  const uploadFolder = path.join(workingDir, 'rwxdata', uploadFolderName);

  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder);
  }

  if (!existsSync(storeFolder)) {
    mkdirSync(storeFolder);
  }
  if (!existsSync(workerFolder)) {
    mkdirSync(workerFolder);
  }
  if (!existsSync(uploadFolder)) {
    mkdirSync(uploadFolder);
  }
  if (!existsSync(tmpFolder)) {
    mkdirSync(tmpFolder);
  }

  syncWorkerFolder();
};

export const syncWorkerFolder = () => {
  let workingDir = __dirname;

  if (!!process.env.READWORKS_PROJECT) {
    workingDir = process.env.READWORKS_PROJECT;

    if (!existsSync(workingDir)) {
      mkdirSync(workingDir);
    }
  }

  const storeFolder = path.join(workingDir, 'rwxdata', storeFolderName);
  const workerFolder = path.join(workingDir, workerFolderName);

  if (!existsSync(path.join(workingDir, 'rwxdata'))) {
    mkdirSync(path.join(workingDir, 'rwxdata'));
  }

  if (!existsSync(workerFolder)) {
    mkdirSync(workerFolder);
  }

  if (!existsSync(storeFolder)) {
    mkdirSync(storeFolder);
  }

  const cases = readdirSync(storeFolder);

  cases.forEach((caseName: string) => {
    if (
      !lstatSync(path.join(storeFolder, caseName)).isDirectory() ||
      existsSync(path.join(workerFolder, caseName))
    ) {
      return;
    }

    mkdirSync(path.join(workerFolder, caseName));
  });

  const workers = readdirSync(workerFolder);

  workers.forEach((worker: string) => {
    if (cases.includes(worker)) {
      return;
    }

    rimraf.sync(path.join(workerFolder, worker));
  });
};

export const autoImportWorker = (hostname: string, port: number) => {
  appLogger('run autoImportWorker', 'fileWatcher');

  let workingDir = __dirname;
  if (!!process.env.READWORKS_PROJECT) {
    workingDir = process.env.READWORKS_PROJECT;

    if (!existsSync(workingDir)) {
      mkdirSync(workingDir);
    }
  }

  const workerFolder = path.join(workingDir, workerFolderName);

  if (!existsSync(workerFolder)) {
    mkdirSync(workerFolder);
  }

  const chokidar = require('chokidar');

  const watcher = chokidar.watch(workerFolder, { persistent: true });

  watcher
    .on('add', async (path: any) => {
      appLogger(path, 'fileWatcher');

      try {
        appLogger('add ' + path, 'fileWatcher');

        const pathSegments = path.replace(/\\/g, '/').split('/');
        const fileName = pathSegments.pop();
        const caseId = parseInt(pathSegments.pop().match(/^\d+/)[0], 10);

        const isPDF = path.slice(-4).toLowerCase() === '.pdf';

        if (!caseId || caseId < 1 || !isPDF) {
          return;
        }

        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('filename', fileName);
        formData.append('file', createReadStream(path));

        await axios.post(`http://${hostname}:${port}/document`, formData, {
          headers: formData.getHeaders(),
        });
        await rimraf(path);
      } catch (e: any) {
        appLogger(e.message, 'fileWatcher');
      }
    })
    .on('change', (path: any) => {
      //console.info('File', path, 'has been changed');
    })
    .on('unlink', (path: any) => {
      //console.info('File', path, 'has been removed');
    })
    .on('error', (error: any) => {
      //console.info('Error happened', error);
    });

  return watcher;
};
