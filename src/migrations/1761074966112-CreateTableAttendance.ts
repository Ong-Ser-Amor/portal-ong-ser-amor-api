import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateTableAttendance1761074966112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendance',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'present',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'notes',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'lesson_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('attendance', [
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'student',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lesson',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('attendance', [
      new TableIndex({
        name: 'IDX_ATTENDANCE_STUDENT_ID',
        columnNames: ['student_id'],
      }),
      new TableIndex({
        name: 'IDX_ATTENDANCE_LESSON_ID',
        columnNames: ['lesson_id'],
      }),
    ]);

    await queryRunner.createUniqueConstraint(
      'attendance',
      new TableUnique({
        name: 'UQ_ATTENDANCE_STUDENT_LESSON',
        columnNames: ['student_id', 'lesson_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      'attendance',
      'UQ_ATTENDANCE_STUDENT_LESSON',
    );

    await queryRunner.dropIndex('attendance', 'IDX_ATTENDANCE_LESSON_ID');
    await queryRunner.dropIndex('attendance', 'IDX_ATTENDANCE_STUDENT_ID');

    const table = await queryRunner.getTable('attendance');
    const studentForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('student_id') !== -1,
    );
    const lessonForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('lesson_id') !== -1,
    );
    await queryRunner.dropForeignKey('attendance', studentForeignKey);
    await queryRunner.dropForeignKey('attendance', lessonForeignKey);

    await queryRunner.dropTable('attendance');
  }
}
