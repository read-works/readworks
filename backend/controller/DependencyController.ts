import { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import { appLogger } from '../helpers/app-logger';
import { existsSync } from 'fs';
import { platform } from 'os';

const namespace = '/health/';

export const DependencyController = (app: Express, io: Server) => {
  const probeMSVCPdll = () => {
    if (platform() !== 'win32') {
      return;
    }
    const win32Present = existsSync('C:/Windows/System32/msvcp140.dll');

    if (!win32Present) {
      appLogger('MSVCP140.dll is not present!');
      return { status: 'sick', message: 'NO_DDL_PRESENT' };
    } else {
      appLogger('MSVCP140.dll is present in System32', 'dll probe');
      return { stauts: 'healthy' };
    }
  };

  app.get(namespace, (req: Request, res: Response) => {
    res.send(probeMSVCPdll());
  });
};
