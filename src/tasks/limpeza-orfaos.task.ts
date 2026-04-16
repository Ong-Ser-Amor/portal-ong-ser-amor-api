import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LimpezaOrfaosTask {
  private readonly logger = new Logger(LimpezaOrfaosTask.name);

  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
  ) {}

  // O decorator @Cron define o gatilho. Aqui, roda todo dia às 03:00 da manhã.
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async executar() {
    this.logger.log('Iniciando rotina de limpeza de pessoas órfãs...');

    try {
      const orfaos = await this.pessoaRepository
        .createQueryBuilder('pessoa')
        .leftJoin(
          'beneficiarios',
          'b',
          'b.pessoa_id = pessoa.id AND b.deletado_em IS NULL',
        )
        .leftJoin(
          'voluntarios',
          'v',
          'v.pessoa_id = pessoa.id AND v.deletado_em IS NULL',
        )
        .where('pessoa.deletado_em IS NULL')
        .andWhere('b.id IS NULL') // Se for nulo, é porque não achou beneficiário para essa pessoa
        .andWhere('v.id IS NULL') // Se for nulo, é porque não achou voluntário para essa pessoa
        .getMany();

      if (orfaos.length > 0) {
        // Extrai apenas os IDs das pessoas encontradas
        const idsOrfaos = orfaos.map((pessoa) => pessoa.id);

        // Executa o softDelete em massa passando o array de IDs
        await this.pessoaRepository.softDelete(idsOrfaos);

        this.logger.log(
          `Limpeza concluída. ${orfaos.length} pessoas órfãs foram inativadas.`,
        );
      } else {
        this.logger.log('Limpeza concluída. Nenhuma pessoa órfã encontrada.');
      }
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Falha ao executar limpeza de órfãos: ${mensagemErro}`);
    }
  }
}
