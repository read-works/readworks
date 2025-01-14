import {
  Column,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { PageWord } from './PageWord';
import { SearchResult } from './SearchResult';

@Table({
  tableName: 'SearchResultWords',
  modelName: 'SearchResultWords', // TODO Filename and classname and therefore modelName does not follow the naming conventions
})
export class SearchResultWords extends Model {
  @ForeignKey(() => SearchResult)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueResultWord',
    unique: true,
  })
  declare resultId: number;

  @ForeignKey(() => PageWord)
  @Index({
    name: 'uniqueResultWord',
    unique: true,
  })
  @Column(DataType.INTEGER)
  declare wordId: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isExcluded: boolean;

  @DeletedAt
  declare deletionDate: Date;
}
