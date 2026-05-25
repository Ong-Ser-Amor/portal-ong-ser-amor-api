import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Endereco } from 'src/enderecos/entities/endereco.entity';
import { Familia } from 'src/familias/entities/familia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LimpezaFamiliasOrfaosTask {
  private readonly logger = new Logger(LimpezaFamiliasOrfaosTask.name);

  constructor(
    @InjectRepository(Familia)
    private readonly familiaRepository: Repository<Familia>,
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM) // Roda às 04:00, depois da limpeza de Pessoas
  async executar() {
    this.logger.log(
      'Iniciando rotina de limpeza de Famílias e Endereços órfãos...',
    );

    try {
      // Achar Famílias sem Beneficiários ativos
      const familiasOrfas = await this.familiaRepository
        .createQueryBuilder('familia')
        .leftJoin(
          'beneficiarios',
          'b',
          'b.familia_id = familia.id AND b.deletado_em IS NULL',
        )
        .where('familia.deletado_em IS NULL')
        .andWhere('b.id IS NULL') // Não achou nenhum beneficiário ativo
        .getMany();

      if (familiasOrfas.length > 0) {
        const idsFamilias = familiasOrfas.map((f) => f.id);
        const idsEnderecos = familiasOrfas.map((f) => f.enderecoId);

        // Executa o softDelete nas Famílias
        await this.familiaRepository.softDelete(idsFamilias);

        // Executa o softDelete nos Endereços dessas famílias (para não deixar lixo)
        // Usa set literal para remover IDs duplicados caso existam
        const enderecosUnicos = [...new Set(idsEnderecos)];
        await this.enderecoRepository.softDelete(enderecosUnicos);

        this.logger.log(
          `Limpeza concluída. ${familiasOrfas.length} famílias órfãs (e seus endereços) foram inativadas.`,
        );
      } else {
        this.logger.log('Limpeza concluída. Nenhuma família órfã encontrada.');
      }
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Falha ao executar limpeza de famílias órfãs: ${mensagemErro}`,
      );
    }
  }
}
