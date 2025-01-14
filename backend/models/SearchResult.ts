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
import { Document } from './Document';
import { Page } from './Page';
import { PageWord } from './PageWord';
import { Search } from './Search';
import { SearchResultWords } from './SearchResultWords';
import { Note } from './Note';
import { SearchResultNote } from './SearchResultNote';

@Table({
  tableName: 'SearchResults',
  modelName: 'SearchResult',
})
export class SearchResult extends Model {
  @Column(DataType.BOOLEAN)
  declare ignore: boolean;

  @Column(DataType.INTEGER)
  declare occurrences: number;

  @Column(DataType.FLOAT)
  declare score: number;

  @DeletedAt
  declare deletionDate: Date;

  @ForeignKey(() => Document)
  @Index({
    name: 'uniqueSearchResults',
    unique: true,
  })
  @Index({ name: 'documentIdIndex' })
  @Column(DataType.INTEGER)
  declare documentId: number;

  @BelongsTo(() => Document)
  declare document: Document;

  @ForeignKey(() => Page)
  @Index({
    name: 'uniqueSearchResults',
    unique: true,
  })
  @Column(DataType.INTEGER)
  declare pageId: number;

  @BelongsTo(() => Page)
  declare page: Page;

  @ForeignKey(() => Search)
  @Index({
    name: 'uniqueSearchResults',
    unique: true,
  })
  @Column(DataType.INTEGER)
  declare searchId: number;

  @BelongsTo(() => Search)
  declare search: Search;

  @BelongsToMany(() => PageWord, () => SearchResultWords)
  declare words: PageWord[];

  @BelongsToMany(() => Note, () => SearchResultNote)
  declare notes: Note[];
}
