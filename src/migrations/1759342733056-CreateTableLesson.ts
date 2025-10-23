import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTableLesson1759342733056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lesson',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'course_class_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'topic',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'lesson',
      new TableForeignKey({
        columnNames: ['course_class_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course_class',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'lesson',
      new TableIndex({
        name: 'IDX_LESSON_COURSE_CLASS_ID',
        columnNames: ['course_class_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('lesson', 'IDX_LESSON_COURSE_CLASS_ID');

    const table = await queryRunner.getTable('lesson');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('course_class_id') !== -1,
    );
    await queryRunner.dropForeignKey('lesson', foreignKey);

    await queryRunner.dropTable('lesson');
  }
}
