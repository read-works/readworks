
export type CaseStatus = "created" | "modified" | "deleted";

export interface Case {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseCreateRequest {
  title: string;
}

export interface SearchMatch {
  query: string;
  color: string;
  id: number;
  documentMatchCount?: number;
}

export interface Document {
  id: number;
  caseId: number;
  originalName: string;
  originalFile?: string;
  creationDate: string;
  pageCount: number;
  pages?: Page[];
  fileSize: number;
  processed: boolean;
  searchMatches: SearchMatch[];
  uniformRatio?: boolean;
  onStage?: boolean;
}

export interface Word {
  id: number;
  text: string;
  processed: string;
  bgColor?: string;
  textColor?: string;
  highlight?: boolean;
  sourroundingColor?: string;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  searchId?: number;
  resultId?: number;
  isExcluded?: boolean;
  hasAttention?: boolean;
}

export interface Page {
  id: number;
  documentId: number;
  filename: string;
  originalName: string;
  thumbnail: string;
  image: string;
  pageNumber: number;
  width: number;
  height: number;
  bookmarked: boolean;
  searchMatches?: SearchMatch[];
  words: Word[];
  notes?: Note[];
  noteCount?: number;
}

export interface Bookmark {
  documentId: number;
  documentName: string;
  pages: Page[];
}

export interface Bookmarks {
  caseDocuments?: Bookmark[];
  currentDocument?: Bookmark;
}

export interface Search {
  id: number;
  query: string;
  color: string;
  processing: boolean;
  pageCount: number;
  foundCount: number;
  documentCount: number;
}

export interface Settings {
  fastLane: boolean;
  address?: string;
  modulesOpen: boolean;
  blendControls: boolean;
  remote: boolean;
  darkMode: true | false | "system";
  hiddenEulaConfirmed: boolean;
  hiddenFirstStart: boolean;
  hiddenDocumentHintRead: boolean;
  hiddenSearchHintRead: boolean;
  hiddenDownloadUpdate: string;
  restartWebServer?:boolean;
  toggleDarkMode?:boolean;
}

export interface Migration {
  migrationRequired: boolean;
  isOutdatedVersion: boolean;
  isSameVersion: boolean;
  appVersion: string;
  databaseVersion: string;
}

export interface MigrationMetaData {
  percentCompleted: number;
  output: string;
}

export interface AvailableUpdate {
  version?: string;
  file?: string;
}

export interface UpdateUrl {
  url?: string;
}

export interface License {
  email: string;
  license: string;
}

export type NoteType = "case" | "document" | "page" | "searchMatch" | "word";

export interface Note {
  id: number;
  name: string;
  content: any;
  type: NoteType;
  color?: string;
  locked?: boolean;
  x?: number;
  y?: number;
  foreignId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchMatchDistribution {
  text: string;
  count: number;
  share?: number;
}

export interface LwmDbEntry {
  w: string;
  rel: Record<string, number[]>;
}

export interface LwmDbEntryRef extends LwmDbEntry {
  id: number;
}

export interface Lwm {
  map: Record<string, number>;
  db: LwmDbEntry[];
}

export interface SynonymGroup {
  id: number;
  w: string;
  groups: string[];
}
