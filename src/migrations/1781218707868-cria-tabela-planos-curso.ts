import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaPlanosCurso1781218707868 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'planos_curso',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'curso_id',
            type: 'bigint',
            isNullable: false,
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
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deletado_em',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'planos_curso',
      new TableForeignKey({
        name: 'FK_planos_curso_curso_id',
        columnNames: ['curso_id'],
        referencedTableName: 'cursos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Índice único composto, Case-Insensitive e Accent-Insensitive (ignora registro deletado)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_planos_curso_curso_id_nome"
      ON "planos_curso" ("curso_id", LOWER(f_unaccent("nome")))
      WHERE "deletado_em" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'planos_curso',
      'UQ_planos_curso_curso_id_nome',
    );
    await queryRunner.dropForeignKey(
      'planos_curso',
      'FK_planos_curso_curso_id',
    );
    await queryRunner.dropTable('planos_curso');
  }
}
