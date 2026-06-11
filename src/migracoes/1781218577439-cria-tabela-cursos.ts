import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriaTabelaCursos1781218577439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cursos',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletado_em',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // Cria o Índice Único (Sem acento, minúsculo, ignorando os deletados)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_cursos_nome"
      ON "cursos" (LOWER(f_unaccent("nome")))
      WHERE "deletado_em" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_cursos_nome"`);
    await queryRunner.dropTable('cursos');
  }
}
