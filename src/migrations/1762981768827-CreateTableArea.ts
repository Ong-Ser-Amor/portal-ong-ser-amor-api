import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTableArea1762981768827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'area',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
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
      'area',
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'location',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'area',
      new TableIndex({
        name: 'IDX_AREA_LOCATION_ID',
        columnNames: ['location_id'],
      }),
    );

    await queryRunner.createIndex(
      'area',
      new TableIndex({
        name: 'UQ_AREA_NAME_LOCATION_ID',
        columnNames: ['name', 'location_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('area', 'UQ_AREA_NAME_LOCATION_ID');
    await queryRunner.dropIndex('area', 'IDX_AREA_LOCATION_ID');

    const table = await queryRunner.getTable('area');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('location_id') !== -1,
    );
    await queryRunner.dropForeignKey('area', foreignKey);
    await queryRunner.dropTable('area');
  }
}
