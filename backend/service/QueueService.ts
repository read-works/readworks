import { cpus } from 'os';
import { Document } from '../models/Document';
import { Page } from '../models/Page';
import { Server, Socket } from 'socket.io';
import { appLogger } from '../helpers/app-logger';
import { DocumentProcessingService } from './DocumentProcessingService';
import { PopplerService } from './PopplerService';
import { SearchService } from './SearchService';

const MAX_CONCURRENT_JOBS = Math.max(Math.round(cpus().length / 2), 1);

interface ProcessingJob {
  newDocument: Document;
  thumbFolder: string;
  file: Express.Multer.File;
  clientSocket?: Socket;
}

export class QueueService {
  private readonly processingQueue: {
    running: boolean;
    queue: ProcessingJob[];
    processes: number;
  };
  private readonly io: Server;
  private readonly documentProcessor: DocumentProcessingService;

  constructor(io: Server) {
    this.processingQueue = {
      running: false,
      queue: [],
      processes: 0,
    };
    this.io = io;
    this.documentProcessor = new DocumentProcessingService(io);
  }

  public async processDocument(
    newDocument: Document,
    thumbFolder: string,
    file: Express.Multer.File,
    clientSocket?: Socket,
    password?: string,
  ): Promise<void> {
    try {
      const poppler = PopplerService();
      const totalPages = await poppler.getTotalPages(newDocument.filePath, password);
      appLogger(`document has ${totalPages} pages`);

      this.io.emit('processingDocument', {
        documentId: newDocument.id,
        name: file.originalname,
        percentCompleted: 0,
        lastPageProcessed: 0,
        totalPages: totalPages,
      });

      let processedBy: string | undefined;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        const result = await this.documentProcessor.processPage(
          newDocument,
          thumbFolder,
          file,
          pageNumber,
          totalPages,
          password,
        );
        processedBy = result.processedBy;
      }

      if (processedBy) {
        await newDocument.update({
          processed: true,
          pageCount: totalPages,
          processedBy: processedBy,
          uniformRatio: await this.checkForUniformPageRatio(newDocument.id),
        });

        appLogger('perform search on newly created document ' + newDocument.originalName);
        const search = await SearchService(newDocument.caseId.toString(), this.io);
        await search.newDocument(newDocument);
        appLogger('searching of document ' + newDocument.originalName + ' done ');
      }
    } catch (e: any) {
      appLogger(e);
      if (e.message === 'Command Line Error: Incorrect password') {
        appLogger('document required password');

        if (!clientSocket) {
          appLogger(e);
          appLogger('cannot show client password prompt');
        } else {
          this.handlePasswordProtectedDocument(newDocument, thumbFolder, file, clientSocket);
        }
      }
    }
  }

  private handlePasswordProtectedDocument(
    newDocument: Document,
    thumbFolder: string,
    file: Express.Multer.File,
    clientSocket: Socket,
  ): void {
    const applyPasswordOnFileCancellation = async (activeCancellation = true) => {
      clientSocket.off(file.originalname, applyPasswordOnFileOrRetry);
      clientSocket.off('cancel' + file.originalname, applyPasswordOnFileCancellation);

      if (activeCancellation) {
        await Document.destroy({ where: { id: newDocument.id } });
      }
    };

    const applyPasswordOnFileOrRetry = async (password: string) => {
      console.log('received pw');

      await applyPasswordOnFileCancellation(false);

      setTimeout(async () => {
        await this.processDocument(newDocument, thumbFolder, file, clientSocket, password);
      }, 1000);
    };

    clientSocket.on(file.originalname, applyPasswordOnFileOrRetry);
    clientSocket.on('cancel' + file.originalname, applyPasswordOnFileCancellation);

    setTimeout(() => {
      clientSocket.emit('documentRequiresPassword', file.originalname);
    }, 500);
  }

  private async checkForUniformPageRatio(documentId: number): Promise<boolean> {
    const rows = await Page.findAll({
      where: { documentId: documentId },
      group: ['height', 'width'],
    });
    return rows.length <= 1;
  }

  public addToQueue(job: ProcessingJob): void {
    if (this.processingQueue.processes < MAX_CONCURRENT_JOBS) {
      setTimeout(async () => {
        this.processingQueue.processes++;
        appLogger('start document processing');
        try {
          appLogger('call processDocument');
          await this.processDocument(job.newDocument, job.thumbFolder, job.file, job.clientSocket);
        } catch (e) {
          appLogger('Processing failed');
          appLogger(e);
        }
        this.processingQueue.processes--;
        if (this.processingQueue.queue.length) {
          this.runQueue();
        }
      }, 0);
    } else {
      this.processingQueue.queue.push(job);
    }
  }

  private runQueue(): void {
    if (!this.processingQueue.queue.length) {
      return;
    }

    setTimeout(async () => {
      const job = this.processingQueue.queue.pop();
      if (job) {
        this.processingQueue.processes++;
        await this.processDocument(job.newDocument, job.thumbFolder, job.file, job.clientSocket);
        this.processingQueue.processes--;
        if (this.processingQueue.queue.length) {
          this.runQueue();
        }
      }
    }, 0);
  }
}
