import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriaTabelaContatos1775870216271 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contatos',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'tipo_contato',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'valor',
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
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contatos');
  }
}
