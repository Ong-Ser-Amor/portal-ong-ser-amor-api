import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableFamilies1773793830626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'families',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'income_range',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'receives_income_transfer',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'housing_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'address_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'families',
      new TableForeignKey({
        name: 'fk_families_address_id',
        columnNames: ['address_id'],
        referencedTableName: 'addresses',
        referencedColumnNames: ['id'],
        // RESTRICT: Impede que o endereço seja deletado se houver uma família vinculada a ele
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('families', 'fk_families_address_id');
    await queryRunner.dropTable('families');
  }
}
