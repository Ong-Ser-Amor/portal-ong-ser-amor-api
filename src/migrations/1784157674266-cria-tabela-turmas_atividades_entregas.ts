import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CriaTabelaTurmasAtividadesEntregas1784157674266
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'turmas_atividades_entregas',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'atividade_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'matricula_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'status_entrega',
            type: 'varchar',
            length: '30',
            isNullable: false,
            default: "'PENDENTE'",
          },
          {
            name: 'nota_obtida',
            type: 'decimal',
            precision: 7,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'data_entrega',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'observacao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletado_em',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'turmas_atividades_entregas',
      new TableForeignKey({
        name: 'FK_turmas_atividades_entregas_atividade',
        columnNames: ['atividade_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas_atividades',
        onDelete: 'CASCADE', // Se excluir a atividade, limpa as entregas
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'turmas_atividades_entregas',
      new TableForeignKey({
        name: 'FK_turmas_atividades_entregas_matricula',
        columnNames: ['matricula_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas_matriculas',
        onDelete: 'RESTRICT', // Impede excluir matrícula se houver histórico de entregas
        onUpdate: 'CASCADE',
      }),
    );

    // Unicidade Composta: Apenas 1 registro de entrega por aluno para cada atividade
    await queryRunner.createUniqueConstraint(
      'turmas_atividades_entregas',
      new TableUnique({
        name: 'UQ_turmas_atividades_entregas_atividade_matricula',
        columnNames: ['atividade_id', 'matricula_id'],
      }),
    );

    // Índices para buscas performáticas
    await queryRunner.createIndex(
      'turmas_atividades_entregas',
      new TableIndex({
        name: 'IDX_turmas_atividades_entregas_atividade',
        columnNames: ['atividade_id'],
      }),
    );

    await queryRunner.createIndex(
      'turmas_atividades_entregas',
      new TableIndex({
        name: 'IDX_turmas_atividades_entregas_matricula',
        columnNames: ['matricula_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'turmas_atividades_entregas',
      'IDX_turmas_atividades_entregas_matricula',
    );
    await queryRunner.dropIndex(
      'turmas_atividades_entregas',
      'IDX_turmas_atividades_entregas_atividade',
    );
    await queryRunner.dropUniqueConstraint(
      'turmas_atividades_entregas',
      'UQ_turmas_atividades_entregas_atividade_matricula',
    );
    await queryRunner.dropForeignKey(
      'turmas_atividades_entregas',
      'FK_turmas_atividades_entregas_matricula',
    );
    await queryRunner.dropForeignKey(
      'turmas_atividades_entregas',
      'FK_turmas_atividades_entregas_atividade',
    );
    await queryRunner.dropTable('turmas_atividades_entregas');
  }
}
