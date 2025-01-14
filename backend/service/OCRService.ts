import Tesseract, { createWorker, Worker } from 'tesseract.js';
import path from 'path';
import { appLogger } from '../helpers/app-logger';
import process from 'process';
import { getExtLibDir, isDevMode } from '../server';

export const OCRService = async () => {
  appLogger(`data dir is ${process.env.READWORKS_DATA_DIR}`);
  const langDir = path.join(getExtLibDir(), 'lang-data');
  appLogger('create ocr worker');
  appLogger(`tesseract langdir ${langDir}`);

  let worker: Worker;

  try {
    worker = await createWorker('deu', 3, {
      langPath: langDir,
      errorHandler: (e) => appLogger(e),
      logger: (m) => appLogger(m),
      cachePath: process.env.READWORKS_DATA_DIR,
    });
    appLogger('worker created');
  } catch (e) {
    appLogger('worker dead');
    appLogger(e);
  }

  appLogger('continue');

  return {
    processPage: async (targetFile: string): Promise<Tesseract.Page> => {
      const data = await worker.recognize(targetFile, undefined);
      return data.data;
    },
    terminate: async () => {
      await worker.terminate();
    },
  };
};
