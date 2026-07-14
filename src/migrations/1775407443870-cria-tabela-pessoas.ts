import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CriaTabelaPessoas1775407443870 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pessoas',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'nome',
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
            name: 'data_nascimento',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'emancipado',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'pode_sair_sozinho',
            type: 'boolean',
            isNullable: true,
            comment:
              'A criança/adolescente tem permissão para ir embora sozinha?',
          },
          {
            name: 'responsavel_id',
            type: 'bigint',
            isNullable: true,
            comment:
              'Auto-relacionamento: ID da pessoa que é o responsável legal',
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletado_em',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pessoas',
      new TableForeignKey({
        name: 'fk_pessoas_responsavel_id',
        columnNames: ['responsavel_id'],
        referencedTableName: 'pessoas',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Se o responsável for deletado, não deleta a criança
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('pessoas', 'fk_pessoas_responsavel_id');
    await queryRunner.dropTable('pessoas');
  }
}
