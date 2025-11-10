import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAsset1762733629642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'asset',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'patrimony_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'serial_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'acquisition_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'initial_state',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'acquisition_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'acquisition_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'down_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'down_reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'asset_category_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'department_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'responsible_user_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );

    // Criando chave estrangeira para categoria do patrimônio
    await queryRunner.createForeignKey(
      'asset',
      new TableForeignKey({
        columnNames: ['asset_category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'asset_category',
        onDelete: 'RESTRICT',
      }),
    );

    // Criando chave estrangeira para localização
    await queryRunner.createForeignKey(
      'asset',
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'location',
        onDelete: 'RESTRICT',
      }),
    );

    // Criando chave estrangeira para departamento
    await queryRunner.createForeignKey(
      'asset',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'department',
        onDelete: 'SET NULL',
      }),
    );

    // Criando chave estrangeira para usuário responsável
    await queryRunner.createForeignKey(
      'asset',
      new TableForeignKey({
        columnNames: ['responsible_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('asset');
    const foreignKeys = table?.foreignKeys;

    if (foreignKeys) {
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('asset', foreignKey);
      }
    }

    await queryRunner.dropTable('asset');
  }
}
