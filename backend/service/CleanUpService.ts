import { Server } from 'socket.io';
import { FileService } from './FileService';
import { DocumentInterface } from '../interfaces/DocumentInterface';
import { SearchInterface } from '../interfaces/SearchInterface';
import { Document } from '../models/Document';
import { Search } from '../models/Search';
import { SearchService } from './SearchService';

export const CleanUpService = async (io: Server) => {
  const fileService = new FileService();

  const clearTmpFolder = async () => {
    await fileService.clearTmpFolder();
  };

  const clearNonProcessedDocuments = async () => {
    const documentInterface = DocumentInterface(io);
    const undoneDocumentIds = await Document.findAll({
      where: { processed: false },
      attributes: ['id'],
      raw: true,
    });
    for (const document of undoneDocumentIds) {
      await documentInterface.remove(document.id);
    }
  };

  const clearSearchesInProcess = async () => {
    const searchInterface = SearchInterface(io);
    const undoneSearches = await Search.findAll({
      where: { processing: true },
      attributes: ['id'],
      raw: true,
    });

    for (const search of undoneSearches) {
      await searchInterface.remove(search.id);
    }
  };

  const rerunSearchesInProcess = async () => {
    const undoneSearches = await Search.findAll({
      where: { processing: true },
    });

    for (const search of undoneSearches) {
      const searchService = await SearchService(search.caseId.toString(), io);
      await searchService.newSearchQuery(search);
    }
  };

  return {
    run: () => {
      clearTmpFolder();
      clearNonProcessedDocuments();
      rerunSearchesInProcess();
    },
  };
};
