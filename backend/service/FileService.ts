import { copyFile, mkdir, rm } from 'fs/promises';
import { rimraf } from 'rimraf';
import md5File from 'md5-file';
import path from 'path';
import { Model } from 'sequelize';
import { Document } from '../models/Document';
import { Page } from '../models/Page';
import { PageWord } from '../models/PageWord';
import { SearchResult } from '../models/SearchResult';
import { appLogger } from '../helpers/app-logger';

export class FileService {
  public async createThumbnailDirectory(thumbFolder: string): Promise<void> {
    await mkdir(thumbFolder);
    appLogger('created thumbnail folder');
  }

  public async copyFileToTarget(sourceFile: string, targetFile: string): Promise<void> {
    await copyFile(sourceFile, targetFile);
    appLogger('copied file into case');
    await rm(sourceFile);
    appLogger('source file flushed');
  }

  public async calculateFileHash(filePath: string): Promise<string> {
    return await md5File(filePath);
  }

  public async removeDocument(document: Document, tmpFolder: string): Promise<void> {
    try {
      await rm(document.filePath);
    } catch (e:any) {
      appLogger(`cant delete document as path:  ${document.filePath} is nonexistent`);
    }

    const pages = await Page.findAll({ where: { documentId: document.id } });

    if (pages.length) {
      try {
        await rimraf.moveRemove(pages[0].filePath, { tmp: tmpFolder });
      } catch (e: any) {
        appLogger(`failed removing page image ${e.message}`);
      }
      await PageWord.destroy({
        where: {
          pageId: pages.map((page) => page.id),
        },
      });
    }

    await SearchResult.destroy({ where: { documentId: document.id } });
    await Page.destroy({ where: { documentId: document.id } });
  }

  public getTmpFolder(): string {
    if (process.env.READWORKS_PROJECT) {
      return path.join(process.env.READWORKS_PROJECT + '/tmp/');
    }
    return path.join(__dirname + '/../tmp/');
  }

  public async clearTmpFolder(): Promise<void> {
    const tmpFolder = this.getTmpFolder();
    try {
      await rimraf(tmpFolder + '*', { glob: true });
      appLogger('cleared tmp folder');
    } catch (error) {
      appLogger(`failed clearing tmp folder: ${error}`);
    }
  }

  public async moveAndRemove(targetPath: string): Promise<void> {
    const tmpFolder = this.getTmpFolder();
    try {
      await rimraf.moveRemove(targetPath, { tmp: tmpFolder });
      appLogger(`removed ${targetPath}`);
    } catch (error) {
      appLogger(`failed removing ${targetPath}: ${error}`);
    }
  }

  public getTargetFolder(model: Model): string {
    let storeFolder;
    if (process.env.READWORKS_PROJECT) {
      storeFolder = path.join(process.env.READWORKS_PROJECT, 'rwxdata', 'store');
    } else {
      storeFolder = path.join(process.env.READWORKS_APP_ROOT || '', 'rwxdata', 'store');
    }
    return path.join(
      storeFolder,
      model.get('id') + '-' + model.get('title')?.toString()?.replace(/\W/g, '-').toLowerCase(),
    );
  }
}
