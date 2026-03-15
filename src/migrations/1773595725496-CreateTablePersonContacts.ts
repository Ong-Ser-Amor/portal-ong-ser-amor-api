import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTablePersonContacts1773595725496
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'person_contacts',
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
          },
          {
            name: 'contact_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_main',
            type: 'boolean',
            default: false,
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
      'person_contacts',
      new TableForeignKey({
        name: 'fk_person_contacts_person_id',
        columnNames: ['person_id'],
        referencedTableName: 'people',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'person_contacts',
      new TableForeignKey({
        name: 'fk_person_contacts_contact_id',
        columnNames: ['contact_id'],
        referencedTableName: 'contacts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'person_contacts',
      'fk_person_contacts_person_id',
    );
    await queryRunner.dropForeignKey(
      'person_contacts',
      'fk_person_contacts_contact_id',
    );
    await queryRunner.dropTable('person_contacts');
  }
}
