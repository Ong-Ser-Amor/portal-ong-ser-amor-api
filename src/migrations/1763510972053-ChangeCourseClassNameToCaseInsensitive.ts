import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCourseClassNameToCaseInsensitive1763510972053
  implements MigrationInterface
{
  private readonly newIndexName = 'UQ_COURSE_CLASS_NAME_LOWER';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "${this.newIndexName}" ON "course_class" (LOWER("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "${this.newIndexName}"`);
  }
}
