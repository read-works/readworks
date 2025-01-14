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
import { Document } from './Document';
import { PageWord } from './PageWord';
import { SearchResult } from './SearchResult';
import { Note } from './Note';
import { PageNote } from './PageNote';

@Table({
  tableName: 'Pages',
  modelName: 'Page',
})
export class Page extends Model {
  @Column(DataType.STRING(60))
  declare fileName: string;

  @Column(DataType.STRING(300))
  declare filePath: string;

  @Column(DataType.STRING(200))
  declare thumbnail: string;

  @Column(DataType.STRING(200))
  declare image: string;

  @Column(DataType.INTEGER)
  declare width: number;

  @Column(DataType.INTEGER)
  declare height: number;

  @Column(DataType.TEXT)
  declare content: string;

  @Column(DataType.INTEGER)
  @Index
  declare pageNumber: number;

  @Column(DataType.INTEGER)
  declare pageWidth: number;

  @Column(DataType.INTEGER)
  declare pageHeight: number;

  @Column(DataType.FLOAT)
  declare thumbnailScale: number;

  @Column(DataType.FLOAT)
  declare thumbnailPaddingX: number;

  @Column(DataType.FLOAT)
  declare thumbnailPaddingY: number;

  @Column(DataType.BOOLEAN)
  declare bookmarked: boolean;

  @DeletedAt
  declare deletionDate: Date;

  @Index
  @ForeignKey(() => Document)
  @Column(DataType.INTEGER)
  declare documentId: number;

  @BelongsTo(() => Document)
  declare document: Document;

  @HasMany(() => SearchResult)
  declare results: SearchResult[];

  @HasMany(() => PageWord)
  declare words: PageWord[];

  @BelongsToMany(() => Note, () => PageNote)
  declare notes: Note[];
}
