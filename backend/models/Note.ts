import { BelongsToMany, Column, DataType, DeletedAt, Model, Table } from 'sequelize-typescript';
import { Case } from './Case';
import { CaseNote } from './CaseNote';
import { Document } from './Document';
import { DocumentNote } from './DocumentNote';
import { Page } from './Page';
import { PageNote } from './PageNote';
import { PageWord } from './PageWord';
import { SearchResult } from './SearchResult';
import { SearchResultNote } from './SearchResultNote';
import { WordNote } from './WordNote';

@Table({
  tableName: 'Notes',
  modelName: 'Note',
})
export class Note extends Model {
  @Column(DataType.STRING(20))
  declare type: string; // @TODO DK can we use a type here?

  @Column(DataType.JSON)
  declare content: string;

  @Column(DataType.STRING(6))
  declare color: string;

  @Column(DataType.STRING(100))
  declare name: string;

  @Column(DataType.BOOLEAN)
  declare locked: number;

  @Column(DataType.INTEGER)
  declare order: number;

  @DeletedAt
  declare deletionDate: Date;

  @BelongsToMany(() => Case, () => CaseNote)
  declare cases: Case[];

  @BelongsToMany(() => Document, () => DocumentNote)
  declare documents: Document[];

  @BelongsToMany(() => Page, () => PageNote)
  declare pages: Page[];

  @BelongsToMany(() => PageWord, () => WordNote)
  declare words: PageWord[];

  @BelongsToMany(() => SearchResult, () => SearchResultNote)
  declare searchResults: SearchResult[];
}
