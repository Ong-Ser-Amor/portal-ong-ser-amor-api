import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToCourseName1763500472745
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "UQ_COURSE_NAME" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "UQ_COURSE_NAME"`,
    );
  }
}
