import { Column, DataType, DeletedAt, ForeignKey, Index, Model, Table } from 'sequelize-typescript';
import { Note } from './Note';
import { SearchResult } from './SearchResult';

@Table({
  tableName: 'SearchResultNotes',
  modelName: 'SearchResultNote',
})
export class SearchResultNote extends Model {
  @ForeignKey(() => SearchResult)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueSearchResultNote',
    unique: true,
  })
  declare resultId: number;

  @ForeignKey(() => Note)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueSearchResultNote',
    unique: true,
  })
  declare noteId: number;

  @DeletedAt
  declare deletionDate: Date;
}
