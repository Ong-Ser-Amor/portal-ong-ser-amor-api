import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriaTabelaEnderecos1775412446288 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enderecos',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'cep',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'logradouro',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'numero',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'complemento',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'bairro',
            type: 'varchar',
            length: '80',
            isNullable: false,
          },
          {
            name: 'cidade',
            type: 'varchar',
            length: '80',
            isNullable: false,
          },
          {
            name: 'uf',
            type: 'varchar',
            length: '2', // Sigla da UF
            isNullable: false,
          },
          // Colunas de Auditoria
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
    await queryRunner.dropTable('enderecos');
  }
}
