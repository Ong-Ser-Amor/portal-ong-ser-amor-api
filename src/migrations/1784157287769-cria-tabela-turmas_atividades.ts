import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CriaTabelaTurmasAtividades1784157287769
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'turmas_atividades',
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
            name: 'titulo',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tipo_atividade',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'vale_nota',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'nota_maxima',
            type: 'decimal',
            precision: 7,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'data_atribuicao',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'prazo_entrega',
            type: 'date',
            isNullable: false,
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
      'turmas_atividades',
      new TableForeignKey({
        name: 'FK_turmas_atividades_turma',
        columnNames: ['turma_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas',
        onDelete: 'RESTRICT', // Protege o histórico pedagógico de exclusões acidentais de turmas
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'turmas_atividades',
      new TableIndex({
        name: 'IDX_turmas_atividades_turma',
        columnNames: ['turma_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'turmas_atividades',
      'IDX_turmas_atividades_turma',
    );
    await queryRunner.dropForeignKey(
      'turmas_atividades',
      'FK_turmas_atividades_turma',
    );
    await queryRunner.dropTable('turmas_atividades');
  }
}
