import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CriaTabelaAulas1783877319034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'aulas',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'turma_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'data',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'tema',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            isNullable: false,
            default: "'AGENDADA'",
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

    // Chave Estrangeira: Garante o vínculo rígido com a tabela de turmas
    await queryRunner.createForeignKey(
      'aulas',
      new TableForeignKey({
        name: 'FK_aulas_turma',
        columnNames: ['turma_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas',
        onDelete: 'RESTRICT', // Impede excluir uma turma se ela possuir registros de aulas lecionadas
        onUpdate: 'CASCADE',
      }),
    );

    // Restrição de Unicidade Composta: Proíbe 2 aulas no mesmo dia para a mesma turma
    await queryRunner.createUniqueConstraint(
      'aulas',
      new TableUnique({
        name: 'UQ_aulas_turma_data',
        columnNames: ['turma_id', 'data'],
      }),
    );

    // Índice de performance: Acelera as buscas ordenadas por data
    await queryRunner.createIndex(
      'aulas',
      new TableIndex({
        name: 'IDX_aulas_turma_data',
        columnNames: ['turma_id', 'data'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('aulas', 'IDX_aulas_turma_data');
    await queryRunner.dropUniqueConstraint('aulas', 'UQ_aulas_turma_data');
    await queryRunner.dropForeignKey('aulas', 'FK_aulas_turma');
    await queryRunner.dropTable('aulas');
  }
}
