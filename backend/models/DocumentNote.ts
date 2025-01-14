import { Column, DataType, DeletedAt, ForeignKey, Index, Model, Table } from 'sequelize-typescript';
import { Note } from './Note';
import { Document } from './Document';

@Table({
  tableName: 'DocumentNotes',
  modelName: 'DocumentNote',
})
export class DocumentNote extends Model {
  @ForeignKey(() => Document)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueDocumentNote',
    unique: true,
  })
  declare documentId: number;

  @ForeignKey(() => Note)
  @Column(DataType.INTEGER)
  @Index({
    name: 'uniqueDocumentNote',
    unique: true,
  })
  declare noteId: number;

  @DeletedAt
  declare deletionDate: Date;
}
