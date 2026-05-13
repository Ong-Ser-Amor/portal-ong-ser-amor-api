import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateBeneficiariesTable1775261463253
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'beneficiaries',
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
            comment: 'Link to the base Person data',
          },
          {
            name: 'family_id',
            type: 'bigint',
            isNullable: false,
            comment: 'Link to the Family socioeconomic data',
          },
          {
            name: 'education_level',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Enum: Education level of the beneficiary',
          },
          {
            name: 'marital_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Enum: Marital status (Optional for children)',
          },
          {
            name: 'employment_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Enum: Employment status (Optional for children)',
          },
          {
            name: 'number_of_children',
            type: 'integer',
            default: 0,
            isNullable: true,
            comment: 'Number of children (Optional for children)',
          },
          // Colunas de Auditoria
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
      true,
    );

    // 2. Foreign Key para a tabela 'people' (O próprio beneficiário)
    await queryRunner.createForeignKey(
      'beneficiaries',
      new TableForeignKey({
        name: 'fk_beneficiaries_person_id',
        columnNames: ['person_id'],
        referencedTableName: 'people',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Se a pessoa base for apagada, o registro de beneficiário some
        onUpdate: 'CASCADE',
      }),
    );

    // 3. Foreign Key para a tabela 'families'
    await queryRunner.createForeignKey(
      'beneficiaries',
      new TableForeignKey({
        name: 'fk_beneficiaries_family_id',
        columnNames: ['family_id'],
        referencedTableName: 'families',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT', // Protege a família de ser apagada se houver beneficiários vinculados a ela
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
