import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaTurmas1781466723991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'turmas',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'plano_curso_id',
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
            name: 'carga_horaria',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'data_inicio',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'data_fim',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'criterio_avaliacao',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'frequencia_minima',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'nota_minima',
            type: 'decimal',
            precision: 7,
            scale: 2,
            isNullable: true,
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
      'turmas',
      new TableForeignKey({
        name: 'FK_turmas_plano_curso_id',
        columnNames: ['plano_curso_id'],
        referencedTableName: 'planos_curso',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Índice único composto, Case-Insensitive e Accent-Insensitive (ignora registro deletado)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_turmas_plano_curso_id_nome"
      ON "turmas" ("plano_curso_id", LOWER(f_unaccent("nome")))
      WHERE "deletado_em" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('turmas', 'UQ_turmas_plano_curso_id_nome');

    await queryRunner.dropForeignKey('turmas', 'FK_turmas_plano_curso_id');

    await queryRunner.dropTable('turmas');
  }
}
