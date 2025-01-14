import { Column, DataType, DeletedAt, ForeignKey, Index, Model, Table } from 'sequelize-typescript';
import { Note } from './Note';
import { Case } from './Case';

@Table({
  tableName: 'CaseNotes',
  modelName: 'CaseNote',
})
export class CaseNote extends Model {
  @ForeignKey(() => Case)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueCaseNote',
    unique: true,
  })
  declare caseId: number;

  @ForeignKey(() => Note)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueCaseNote',
    unique: true,
  })
  declare noteId: number;

  @DeletedAt
  declare deletionDate: Date;
}
