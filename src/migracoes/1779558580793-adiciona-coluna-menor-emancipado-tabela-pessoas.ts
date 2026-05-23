import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdicionaColunaEmancipadoTabelaPessoas1779558580793
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'pessoas',
      new TableColumn({
        name: 'emancipado',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('pessoas', 'emancipado');
  }
}
