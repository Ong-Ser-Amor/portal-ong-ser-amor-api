import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaFamilias1775879865113 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'familias',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'faixa_renda',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'possui_beneficio_social',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'tipo_moradia',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'endereco_id',
            type: 'bigint',
            isUnique: true,
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
      true, // Mantendo a consistência com as outras migrations
    );

    await queryRunner.createForeignKey(
      'familias',
      new TableForeignKey({
        name: 'fk_familias_endereco_id',
        columnNames: ['endereco_id'],
        referencedTableName: 'enderecos',
        referencedColumnNames: ['id'],
        // RESTRICT: Impede que o endereço seja deletado se houver uma família vinculada a ele
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('familias', 'fk_familias_endereco_id');
    await queryRunner.dropTable('familias');
  }
}
