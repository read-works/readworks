import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Page } from './Page';
import { SearchResult } from './SearchResult';
import { SearchResultWords } from './SearchResultWords';
import { Note } from './Note';
import { WordNote } from './WordNote';

@Table({
  tableName: 'PageWords',
  modelName: 'PageWord',
})
export class PageWord extends Model {
  @Column(DataType.INTEGER)
  declare positionOnPage: number;

  @Column(DataType.STRING(50))
  declare text: string;

  @Column(DataType.FLOAT)
  declare width: number;

  @Column(DataType.FLOAT)
  declare height: number;

  @Column(DataType.FLOAT)
  declare top: number;

  @Column(DataType.FLOAT)
  declare left: number;

  @DeletedAt
  declare deletionDate: Date;

  @Index
  @ForeignKey(() => Page)
  @Column(DataType.INTEGER)
  declare pageId: number;

  @BelongsTo(() => Page)
  declare page: Page;

  @BelongsToMany(() => SearchResult, () => SearchResultWords)
  declare results: SearchResult[];

  @BelongsToMany(() => Note, () => WordNote)
  declare notes: Note[];
}
