import { Column, DataType, DeletedAt, ForeignKey, Index, Model, Table } from 'sequelize-typescript';
import { Note } from './Note';
import { Page } from './Page';

@Table({
  tableName: 'PageNotes',
  modelName: 'PageNote',
})
export class PageNote extends Model {
  @ForeignKey(() => Page)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniquePageNote',
    unique: true,
  })
  declare pageId: number;

  @ForeignKey(() => Note)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniquePageNote',
    unique: true,
  })
  declare noteId: number;

  @Column(DataType.FLOAT)
  declare x: number;

  @Column(DataType.FLOAT)
  declare y: number;

  @Column(DataType.FLOAT)
  declare width: number;

  @Column(DataType.FLOAT)
  declare height: number;

  @DeletedAt
  declare deletionDate: Date;
}
