import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfiguraExtensaoUnaccent1781217474646
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilita a extensão do PostgreSQL para remoção de acentos
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);

    // 2. Cria a nossa função "imutável" de tirar acentos (necessária para os índices)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION f_unaccent(text)
        RETURNS text AS
      $func$
        SELECT public.unaccent('public.unaccent', $1)
      $func$  LANGUAGE sql IMMUTABLE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_unaccent(text);`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent;`);
  }
}
