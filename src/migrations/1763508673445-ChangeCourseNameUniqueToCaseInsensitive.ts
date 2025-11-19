import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCourseNameUniqueToCaseInsensitive1763508673445
  implements MigrationInterface
{
  // Nome da constraint antiga
  private readonly oldConstraintName = 'UQ_COURSE_NAME';
  // Nome do novo índice
  private readonly newIndexName = 'UQ_COURSE_NAME_LOWER';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "${this.oldConstraintName}"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "${this.newIndexName}" ON "course" (LOWER("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "${this.newIndexName}"`);

    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "${this.oldConstraintName}" UNIQUE ("name")`,
    );
  }
}
