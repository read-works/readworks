import { Column, DataType, DeletedAt, ForeignKey, Index, Model, Table } from 'sequelize-typescript';
import { Note } from './Note';
import { PageWord } from './PageWord';

@Table({
  tableName: 'WordNotes',
  modelName: 'WordNote',
})
export class WordNote extends Model {
  @ForeignKey(() => PageWord)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueWordNote',
    unique: true,
  })
  declare wordId: number;

  @ForeignKey(() => Note)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueWordNote',
    unique: true,
  })
  declare noteId: number;

  @DeletedAt
  declare deletionDate: Date;
}
