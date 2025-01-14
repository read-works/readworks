import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Case } from './Case';
import { Page } from './Page';
import { SearchResult } from './SearchResult';
import { Note } from './Note';
import { DocumentNote } from './DocumentNote';

@Table({
  tableName: 'Documents',
  modelName: 'Document',
})
export class Document extends Model {
  @Column(DataType.STRING(100))
  declare originalName: string;

  @Column(DataType.STRING(300))
  declare filePath: string;

  @Column(DataType.INTEGER)
  declare pageCount: number;

  @Column(DataType.BOOLEAN)
  declare uniformRatio: boolean;

  @Column(DataType.BOOLEAN)
  declare processed: boolean;

  @Column(DataType.STRING(7))
  declare processedBy: string;

  @Column(DataType.INTEGER)
  declare fileSize: number;

  @Column(DataType.STRING(32))
  declare md5: string;

  @DeletedAt
  declare deletionDate: Date;

  @Index
  @ForeignKey(() => Case)
  @Column(DataType.INTEGER)
  declare caseId: number;

  @BelongsTo(() => Case)
  declare case: Case;

  @HasMany(() => Page)
  declare pages: Page[];

  @HasMany(() => SearchResult)
  declare results: SearchResult[];

  @BelongsToMany(() => Note, () => DocumentNote)
  declare notes: Note[];
}
