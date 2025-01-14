import {
  BelongsToMany,
  Column,
  DataType,
  DeletedAt,
  HasMany,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Document } from './Document';
import { Search } from './Search';
import { CaseNote } from './CaseNote';
import { Note } from './Note';

@Table({
  tableName: 'Cases',
  modelName: 'Case',
})
export class Case extends Model {
  @Index({
    name: 'uniqueCase',
    unique: true,
  })
  @Column(DataType.STRING(100))
  declare title: string;

  @DeletedAt
  declare deletionDate: Date;

  @HasMany(() => Document)
  declare documents: Document[];

  @HasMany(() => Search)
  declare searches: Search[];

  @BelongsToMany(() => Note, () => CaseNote)
  declare notes: Note[];
}
