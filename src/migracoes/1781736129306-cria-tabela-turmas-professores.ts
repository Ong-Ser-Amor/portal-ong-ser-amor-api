import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaTurmasProfessores1781736129306
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'turmas_professores',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'turma_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'professor_id',
            type: 'bigint',
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
      'turmas_professores',
      new TableForeignKey({
        name: 'FK_turmas_professores_id_turma',
        columnNames: ['turma_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'turmas_professores',
      new TableForeignKey({
        name: 'FK_turmas_professores_id_professor',
        columnNames: ['professor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'voluntarios',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_turmas_professores_turma_id_professor_id"
      ON "turmas_professores" ("turma_id", "professor_id")
      WHERE "deletado_em" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'turmas_professores',
      'UQ_turmas_professores_turma_id_professor_id',
    );
    await queryRunner.dropForeignKey(
      'turmas_professores',
      'FK_turmas_professores_id_professor',
    );
    await queryRunner.dropForeignKey(
      'turmas_professores',
      'FK_turmas_professores_id_turma',
    );
    await queryRunner.dropTable('turmas_professores');
  }
}
