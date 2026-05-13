import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaVoluntarios1775871837329 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'voluntarios',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'pessoa_id',
            type: 'bigint',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'formacao_academica',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status_formacao',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tipo_voluntario',
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
      true,
    );

    await queryRunner.createForeignKey(
      'voluntarios',
      new TableForeignKey({
        name: 'fk_voluntarios_pessoa_id',
        columnNames: ['pessoa_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pessoas',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('voluntarios', 'fk_voluntarios_pessoa_id');
    await queryRunner.dropTable('voluntarios');
  }
}
