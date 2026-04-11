import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaBeneficiarios1775913025804
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'beneficiarios',
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
            name: 'familia_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'nivel_escolaridade',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'estado_civil',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'vinculo_empregaticio',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'quantidade_filhos',
            type: 'integer',
            default: 0,
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
      true,
    );

    await queryRunner.createForeignKey(
      'beneficiarios',
      new TableForeignKey({
        name: 'fk_beneficiarios_pessoa_id',
        columnNames: ['pessoa_id'],
        referencedTableName: 'pessoas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'beneficiarios',
      new TableForeignKey({
        name: 'fk_beneficiarios_familia_id',
        columnNames: ['familia_id'],
        referencedTableName: 'familias',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'beneficiarios',
      'fk_beneficiarios_familia_id',
    );
    await queryRunner.dropForeignKey(
      'beneficiarios',
      'fk_beneficiarios_pessoa_id',
    );
    await queryRunner.dropTable('beneficiarios');
  }
}
