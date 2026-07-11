import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaTurmasMatriculas1783810234027
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'turmas_matriculas',
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
            name: 'beneficiario_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'resultado_final',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'nota_final',
            type: 'decimal',
            precision: 7,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'parecer_pedagogico',
            type: 'text',
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
      'turmas_matriculas',
      new TableForeignKey({
        name: 'FK_turmas_matriculas_turma_id',
        columnNames: ['turma_id'],
        referencedTableName: 'turmas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'turmas_matriculas',
      new TableForeignKey({
        name: 'FK_turmas_matriculas_beneficiario_id',
        columnNames: ['beneficiario_id'],
        referencedTableName: 'beneficiarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Índice único composto: Garante que um aluno só se matricule UMA vez na mesma turma ativa
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_turmas_matriculas_turma_id_beneficiario_id"
      ON "turmas_matriculas" ("turma_id", "beneficiario_id")
      WHERE "deletado_em" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'turmas_matriculas',
      'UQ_turmas_matriculas_turma_id_beneficiario_id',
    );
    await queryRunner.dropForeignKey(
      'turmas_matriculas',
      'FK_turmas_matriculas_beneficiario_id',
    );
    await queryRunner.dropForeignKey(
      'turmas_matriculas',
      'FK_turmas_matriculas_turma_id',
    );
    await queryRunner.dropTable('turmas_matriculas');
  }
}
