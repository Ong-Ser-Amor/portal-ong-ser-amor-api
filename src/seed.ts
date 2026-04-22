import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';
import { TipoVoluntario } from 'src/voluntarios/enums/voluntario.enum';
import { DataSource } from 'typeorm';

import { AppModule } from './app.module';
import { UsuariosService } from './usuarios/usuarios.service';
import { VoluntariosService } from './voluntarios/voluntarios.service';

async function seed() {
  const logger = new Logger('Seed');

  if (process.env.NODE_ENV === 'production') {
    logger.error('Seed não pode ser executado em ambiente de produção.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const configService = app.get(ConfigService);
  const usuariosService = app.get(UsuariosService);
  const voluntariosService = app.get(VoluntariosService);
  const dataSource = app.get(DataSource);

  const nome = configService.get<string>('SEED_ADMIN_NAME');
  const cpf = configService.get<string>('SEED_ADMIN_CPF');
  const dataNascimentoRaw = configService.get<string>('SEED_ADMIN_BIRTHDATE');
  const email = configService.get<string>('SEED_ADMIN_EMAIL');
  const senha = configService.get<string>('SEED_ADMIN_PASSWORD');

  if (!nome || !email || !senha || !cpf || !dataNascimentoRaw) {
    logger.error(
      'Variáveis SEED_ADMIN_NAME, SEED_ADMIN_CPF, SEED_ADMIN_BIRTHDATE, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD são obrigatórias no .env.',
    );
    await app.close();
    process.exit(1);
  }

  const dataNascimento = new Date(`${dataNascimentoRaw}T00:00:00.000Z`);
  if (Number.isNaN(dataNascimento.getTime())) {
    logger.error(
      'SEED_ADMIN_BIRTHDATE inválido. Use o formato YYYY-MM-DD (ex.: 2000-01-01).',
    );
    await app.close();
    process.exit(1);
  }

  const existing = await usuariosService.buscarPorEmail(email);

  if (existing) {
    logger.log(`Usuário admin já existe (${email}). Nenhuma ação realizada.`);
  } else {
    const voluntariosRepository = dataSource.getRepository(Voluntario);

    let voluntarioAdmin = await voluntariosRepository.findOne({
      where: { pessoa: { cpf } },
      relations: ['pessoa'],
    });

    if (!voluntarioAdmin) {
      voluntarioAdmin = await voluntariosService.criar({
        nome,
        cpf,
        dataNascimento,
        tipoVoluntario: TipoVoluntario.COORDENADOR,
        formacaoAcademica: null,
        statusFormacao: null,
      });
      logger.log(
        `Voluntário admin criado com sucesso (CPF: ${cpf}, ID: ${voluntarioAdmin.id}).`,
      );
    }

    await usuariosService.criar({
      email,
      senha,
      voluntarioId: voluntarioAdmin.id,
    });
    logger.log(`Usuário admin criado com sucesso: ${email}`);
  }

  await app.close();
}

void seed();
