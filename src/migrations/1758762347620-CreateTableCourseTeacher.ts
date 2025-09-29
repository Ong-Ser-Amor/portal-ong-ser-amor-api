import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableCourseTeacher1758762347620
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'course_class_teacher',
        columns: [
          {
            name: 'course_class_id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'teacher_id',
            type: 'integer',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('course_class_teacher', [
      new TableForeignKey({
        columnNames: ['course_class_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course_class',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['teacher_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('course_class_teacher');

    const foreignKeyCourseClass = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('course_class_id') !== -1,
    );
    const foreignKeyTeacher = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('teacher_id') !== -1,
    );

    await queryRunner.dropForeignKey(
      'course_class_teacher',
      foreignKeyCourseClass,
    );
    await queryRunner.dropForeignKey('course_class_teacher', foreignKeyTeacher);

    await queryRunner.dropTable('course_class_teacher');
  }
}
