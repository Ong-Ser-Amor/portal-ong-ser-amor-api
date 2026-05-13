import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaPessoasContatos1775878492839
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pessoas_contatos',
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
          },
          {
            name: 'contato_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'eh_principal', // Tradução de is_main
            type: 'boolean',
            default: false,
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

    await queryRunner.createForeignKey(
      'pessoas_contatos',
      new TableForeignKey({
        name: 'fk_pessoas_contatos_pessoa_id',
        columnNames: ['pessoa_id'],
        referencedTableName: 'pessoas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pessoas_contatos',
      new TableForeignKey({
        name: 'fk_pessoas_contatos_contato_id',
        columnNames: ['contato_id'],
        referencedTableName: 'contatos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'pessoas_contatos',
      'fk_pessoas_contatos_pessoa_id',
    );
    await queryRunner.dropForeignKey(
      'pessoas_contatos',
      'fk_pessoas_contatos_contato_id',
    );
    await queryRunner.dropTable('pessoas_contatos');
  }
}
