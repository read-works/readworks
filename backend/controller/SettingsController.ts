import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { appLogger } from '../helpers/app-logger';
import { appVersion } from './MigrationController';

export interface Settings {
  fastLane: boolean;
  address?: string;
  modulesOpen?: boolean;
  blendControls: boolean;
  remote: boolean;
  darkMode: boolean | 'system';
  hiddenFirstStart: boolean;
  hiddenDocumentHintRead: boolean;
  hiddenSearchHintRead: boolean;
  hiddenDownloadUpdate: string;
}

const namespace = '/settings/';
let settings: Settings = {
  fastLane: true,
  modulesOpen: false,
  blendControls: false,
  remote: true,
  darkMode: 'system',
  hiddenFirstStart: false,
  hiddenDocumentHintRead: false,
  hiddenSearchHintRead: false,
  hiddenDownloadUpdate: '',
};

export const getSettings = async (): Promise<Settings> => {
  let settingsFile: string;

  if (process.env.READWORKS_DATA_DIR) {
    settingsFile = process.env.READWORKS_DATA_DIR + '/settings.json';

    const defaultSettings: Settings = {
      fastLane: false,
      modulesOpen: false,
      blendControls: false,
      remote: false,
      darkMode: 'system',
      hiddenFirstStart: false,
      hiddenDocumentHintRead: false,
      hiddenSearchHintRead: false,
      hiddenDownloadUpdate: '',
    };

    if (!existsSync(settingsFile)) {
      // Application (Build version) defaults
      await writeFile(settingsFile, JSON.stringify(defaultSettings));
    }

    settings = JSON.parse(await readFile(settingsFile, 'utf-8')) as Settings;

    // SYNC SETTINGS
    let changeApplied = false;
    if (Object.keys(defaultSettings) > Object.keys(settings)) {
      for (const settingName of Object.keys(defaultSettings) as (keyof Settings)[]) {
        if (settings && settings[settingName] === undefined) {
          //@ts-expect-error type mismatch rc
          settings[settingName] = defaultSettings[settingName];
          changeApplied = true;
        }
      }

      if (changeApplied) {
        await writeFile(settingsFile, JSON.stringify(settings));
      }
    }
  }

  return settings;
};

export const SettingsController = async (app: Express, io: Server) => {
  const settings = await getSettings();

  let settingsFile: string;

  if (process.env.READWORKS_DATA_DIR) {
    settingsFile = process.env.READWORKS_DATA_DIR + '/settings.json';
  }

  app.post(namespace, async (req: Request, res: Response) => {
    let restartWebServer = false;
    let toggleDarkMode = false;

    if (settings.remote !== !!req.body.remote) {
      restartWebServer = true;
    }

    if (settings.darkMode !== req.body.darkMode) {
      toggleDarkMode = true;
    }

    settings.modulesOpen = !!req.body.modulesOpen;
    settings.fastLane = !!req.body.fastLane;
    settings.blendControls = !!req.body.blendControls;
    settings.remote = !!req.body.remote;
    settings.darkMode = req.body.darkMode;
    settings.address = undefined;

    settings.hiddenFirstStart = !!req.body.hiddenFirstStart;
    settings.hiddenDocumentHintRead = !!req.body.hiddenDocumentHintRead;
    settings.hiddenSearchHintRead = !!req.body.hiddenSearchHintRead;
    settings.hiddenDownloadUpdate = req.body.hiddenDownloadUpdate ?? '';

    if (process.env.READWORKS_DATA_DIR && settingsFile) {
      await writeFile(settingsFile, JSON.stringify(settings));
    }

    res.send({
      accepted: true,
      restartWebServer: restartWebServer,
      toggleDarkMode: toggleDarkMode,
    });
  });

  app.get(namespace, async (req: Request, res: Response) => {
    if (!settings.address) {
      // let lookupAddress = await lookup(hostname());
      // settings.address = lookupAddress.address;
    }

    res.send(await getSettings());
  });

  app.get(`${namespace}version`, async (req: Request, res: Response) => {
    res.send({ appVersion: appVersion });
  });
};
