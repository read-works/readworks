import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { appLogger } from '../helpers/app-logger';
import { existsSync, readFileSync } from 'fs';
import { Lwm, LwmDbEntryRef, SynonymGroup } from '../../domain/interfaces';
import { getExtLibDir } from '../server';

const namespace = '/lwm/';

export const LwmController = async (app: Express, io: Server) => {
  //const settings = await getSettings();

  //let settingsFile: string;
  // console.log(process.env);

  const lwmFileLocation = path.join(getExtLibDir(), 'lwm', 'lwm.de.min.json');

  if (existsSync(lwmFileLocation)) {
    appLogger(`lwm file found at ${lwmFileLocation}`);
  } else {
    appLogger(`lwm file not found at ${lwmFileLocation}`);
  }

  appLogger('loading lwm model');
  const LWM = JSON.parse(readFileSync(lwmFileLocation, 'utf-8')) as Lwm;
  appLogger('lwm loading done');

  app.post(namespace, async (req: Request, res: Response) => {
    res.send();
  });

  app.get(namespace + 'groups/:word', async (req: Request, res: Response) => {
    const baseWord = (req.params.word || '').trim();
    const baseWordLowerCase = baseWord.toLowerCase();
    const baseWordCapitalized =
      baseWord === baseWordLowerCase
        ? baseWord.charAt(0).toUpperCase() + baseWord.slice(1)
        : undefined;

    const tokens: string[] = [];
    const matches: number[] = [];

    if (LWM.map[baseWord]) {
      tokens.push(baseWord);
      matches.push(LWM.map[baseWord]);
    }

    if (LWM.map[baseWordLowerCase] && !matches.includes(LWM.map[baseWordLowerCase])) {
      tokens.push(baseWordLowerCase);
      matches.push(LWM.map[baseWordLowerCase]);
    }

    if (
      baseWordCapitalized &&
      LWM.map[baseWordCapitalized] &&
      !matches.includes(LWM.map[baseWordCapitalized])
    ) {
      tokens.push(baseWordCapitalized);
      matches.push(LWM.map[baseWordCapitalized]);
    }

    const response: SynonymGroup[] = [];

    matches.forEach((matchIndex: number, index: number) => {
      if (!Object.keys(LWM.db[matchIndex].rel).length) return;

      response.push({
        id: matchIndex,
        w: tokens[index],
        groups: Object.keys(LWM.db[matchIndex].rel),
      });
    });

    res.type('text/json').send(response);
  });

  app.get(namespace + 'group-words/:wordId/:groupName', async (req: Request, res: Response) => {
    const groupName: string = req.params.groupName.trim();

    if (
      !LWM.db[parseInt(req.params.wordId, 10)] ||
      !LWM.db[parseInt(req.params.wordId, 10)].rel[groupName]
    ) {
      res.send([]);
      return;
    }

    const result: LwmDbEntryRef[] = [];

    LWM.db[parseInt(req.params.wordId, 10)].rel[groupName].forEach((wordId) => {
      if (!wordId) return;

      result.push({
        id: wordId,
        w: LWM.db[wordId].w,
        rel: LWM.db[wordId].rel,
      });
    });

    res.type('text/json').send(result);
  });
};
