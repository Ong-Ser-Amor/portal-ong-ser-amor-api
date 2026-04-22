import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AdicionaVoluntarioIdEmUsuarios1776733568315
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'usuarios',
      new TableColumn({
        name: 'voluntario_id',
        type: 'bigint',
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'usuarios',
      new TableForeignKey({
        name: 'fk_usuarios_voluntario_id',
        columnNames: ['voluntario_id'],
        referencedTableName: 'voluntarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Se o voluntário for deletado (hard delete), o usuário de acesso também cai
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('usuarios', 'fk_usuarios_voluntario_id');
    await queryRunner.dropColumn('usuarios', 'voluntario_id');
  }
}
