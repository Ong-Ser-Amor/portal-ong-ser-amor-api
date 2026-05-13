import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableAddresses1773705464790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'street',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'number',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'complement',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'zip_code',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '2',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addresses');
  }
}
