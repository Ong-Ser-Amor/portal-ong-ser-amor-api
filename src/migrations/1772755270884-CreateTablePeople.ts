import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTablePeople1772755270884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'people',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'cpf',
            type: 'varchar',
            length: '11',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'birth_date',
            type: 'date',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('people');
  }
}
