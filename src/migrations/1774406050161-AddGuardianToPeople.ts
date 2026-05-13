import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddGuardianToPeople1774406050161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'people',
      new TableColumn({
        name: 'can_leave_alone',
        type: 'boolean',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'people',
      new TableColumn({
        name: 'guardian_id',
        type: 'bigint',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'people',
      new TableForeignKey({
        name: 'fk_people_guardian_id',
        columnNames: ['guardian_id'],
        referencedTableName: 'people',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Se o responsável for deletado, a criança fica sem responsável (mas não é deletada)
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('people', 'fk_people_guardian_id');

    await queryRunner.dropColumn('people', 'guardian_id');

    await queryRunner.dropColumn('people', 'can_leave_alone');
  }
}
