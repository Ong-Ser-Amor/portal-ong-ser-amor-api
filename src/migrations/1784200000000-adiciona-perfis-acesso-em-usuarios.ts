import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdicionaPerfisAcessoEmUsuarios1784200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'usuarios',
      new TableColumn({
        name: 'perfis_acesso',
        type: 'varchar',
        length: '100',
        isArray: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('usuarios', 'perfis_acesso');
  }
}
