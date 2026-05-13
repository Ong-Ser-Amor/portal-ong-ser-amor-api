import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableVolunteer1772929131133 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'volunteers',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'person_id',
            type: 'bigint',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'academic_background',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'education_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'volunteer_type',
            type: 'varchar',
            length: '50',
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
      'volunteers',
      new TableForeignKey({
        columnNames: ['person_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'people',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('volunteers');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('person_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('volunteers', foreignKey);
    }
    await queryRunner.dropTable('volunteers');
  }
}
