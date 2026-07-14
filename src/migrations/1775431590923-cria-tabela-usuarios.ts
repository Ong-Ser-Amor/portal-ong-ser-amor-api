import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriaTabelaUsuarios1775431590923 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'senha_hash',
            type: 'varchar',
            length: '255',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
  }
}
