import {
  BelongsTo,
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
import { SearchResult } from './SearchResult';

@Table({
  tableName: 'Searches',
  modelName: 'Search',
})
export class Search extends Model {
  @Column(DataType.STRING(200))
  declare query: string;

  @Column(DataType.STRING(6))
  declare color: string;

  /*
      This queryHash is a SHA256 represented as hexadecimal
       composed by the lower cased query + caseId
      */
  @Column(DataType.STRING(64))
  @Index({
    name: 'uniqueSearchTerm',
    unique: true,
  })
  declare queryHash: string;

  @Column(DataType.BOOLEAN)
  declare processing: boolean;

  @DeletedAt
  declare deletionDate: Date;

  @Index
  @ForeignKey(() => Case)
  @Column(DataType.INTEGER)
  declare caseId: number;

  @BelongsTo(() => Case)
  declare case: Case;

  @HasMany(() => SearchResult)
  declare results: SearchResult[];
}
