import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { appLogger } from './app-logger';
import { unlinkSync } from 'node:fs';
import process from 'process';

const updateTransformationQueue = (entry: string) => {
  if (!process.env.READWORKS_PROJECT) return;

  let queue: string[] = [];
  const queueFile = join(process.env.READWORKS_PROJECT, 'queue.json');

  if (!existsSync(queueFile)) writeFileSync(queueFile, JSON.stringify(queue), 'utf-8');

  try {
    queue = JSON.parse(readFileSync(queueFile, 'utf-8'));

    if (!(queue instanceof Array)) throw new Error('Malformed queue format');
  } catch (error: any) {
    appLogger(error.message);
  }

  if (queue.includes(entry)) {
    console.info(`${entry} already queued`);
    return;
  }

  queue.push(entry);

  writeFileSync(queueFile, JSON.stringify(queue), 'utf-8');
  console.info(`${entry} added to queue`);
};

export const announceTransformation = (identifier: string) => {
  if (!process.env.READWORKS_APP_ROOT) {
    appLogger('READWORKS_APP_ROOT not specified. Migration not possible (Migration Announcer)');
    return;
  }

  const transformerPath = join(process.env.READWORKS_APP_ROOT, 'transformers', `${identifier}.js`);
  if (!existsSync(transformerPath)) {
    appLogger(`Transformer file ${transformerPath} does not exists`, undefined, 'logEntryBackend'); // TODO MAYBE another logEntryUmzug
    return;
  }

  updateTransformationQueue(identifier);
};

export const getNextTransformationTask = () => {
  if (!process.env.READWORKS_PROJECT) return;

  const queueFile = join(process.env.READWORKS_PROJECT, 'queue.json');

  if (!existsSync(queueFile)) return;

  try {
    const queue = JSON.parse(readFileSync(queueFile, 'utf-8'));

    if (!(queue instanceof Array)) throw new Error('Malformed queue format');

    return queue.shift();
  } catch (error: any) {
    appLogger(error.message);
  }
};

export const denounceTransformation = (identifier: string) => {
  if (!process.env.READWORKS_PROJECT) return;
  const queueFile = join(process.env.READWORKS_PROJECT, 'queue.json');

  if (!existsSync(queueFile)) return;

  try {
    const queue = JSON.parse(readFileSync(queueFile, 'utf-8'));

    if (!(queue instanceof Array)) {
      unlinkSync(queueFile);
      return;
    }

    if (!queue.includes(identifier)) return;

    queue.splice(queue.indexOf(identifier), 1);

    if (queue.length) {
      writeFileSync(queueFile, JSON.stringify(queue), 'utf-8');
      return;
    }

    unlinkSync(queueFile);
  } catch (error: any) {
    appLogger(error.message, undefined, 'logEntryTransformer');
  }
};
