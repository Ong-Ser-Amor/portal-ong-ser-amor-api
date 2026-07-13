import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CriaTabelaChamadas1783904192721 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chamadas',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'aula_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'matricula_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'presente',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'falta_justificada',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'motivo_justificativa',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'observacao',
            type: 'varchar',
            length: '255',
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
      'chamadas',
      new TableForeignKey({
        name: 'FK_chamadas_aula',
        columnNames: ['aula_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'aulas',
        onDelete: 'RESTRICT', // Impede excluir uma aula que possua lista de chamadas salvas
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chamadas',
      new TableForeignKey({
        name: 'FK_chamadas_matricula',
        columnNames: ['matricula_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas_matriculas',
        onDelete: 'RESTRICT', // Impede remover o aluno da turma se ele já tiver histórico de frequências
        onUpdate: 'CASCADE',
      }),
    );

    // Restrição de Unicidade Composta: Impede duplicidade de presença do aluno na mesma aula
    await queryRunner.createUniqueConstraint(
      'chamadas',
      new TableUnique({
        name: 'UQ_chamadas_aula_matricula',
        columnNames: ['aula_id', 'matricula_id'],
      }),
    );

    // Índices de performance para acelerar consultas e relatórios de frequência
    await queryRunner.createIndex(
      'chamadas',
      new TableIndex({
        name: 'IDX_chamadas_aula',
        columnNames: ['aula_id'],
      }),
    );

    await queryRunner.createIndex(
      'chamadas',
      new TableIndex({
        name: 'IDX_chamadas_matricula',
        columnNames: ['matricula_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('chamadas', 'IDX_chamadas_matricula');
    await queryRunner.dropIndex('chamadas', 'IDX_chamadas_aula');
    await queryRunner.dropUniqueConstraint(
      'chamadas',
      'UQ_chamadas_aula_matricula',
    );
    await queryRunner.dropForeignKey('chamadas', 'FK_chamadas_matricula');
    await queryRunner.dropForeignKey('chamadas', 'FK_chamadas_aula');
    await queryRunner.dropTable('chamadas');
  }
}
