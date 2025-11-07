import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToCourseClass1762280285592 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'course_class',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['EM_FORMACAO', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA'],
        default: "'EM_FORMACAO'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('course_class', 'status');
  }
}
