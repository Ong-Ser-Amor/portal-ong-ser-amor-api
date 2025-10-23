import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableCourseStudent1759168580869
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'course_class_student',
        columns: [
          {
            name: 'course_class_id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'student_id',
            type: 'integer',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('course_class_student', [
      new TableForeignKey({
        columnNames: ['course_class_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course_class',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'student',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('course_class_student');

    const foreignKeyCourseClass = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('course_class_id') !== -1,
    );
    const foreignKeyStudent = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('student_id') !== -1,
    );

    await queryRunner.dropForeignKey(
      'course_class_student',
      foreignKeyCourseClass,
    );
    await queryRunner.dropForeignKey('course_class_student', foreignKeyStudent);

    await queryRunner.dropTable('course_class_student');
  }
}
