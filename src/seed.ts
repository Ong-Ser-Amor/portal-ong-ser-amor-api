import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { UsuariosService } from './usuarios/usuarios.service';

async function seed() {
  const logger = new Logger('Seed');

  if (process.env.NODE_ENV === 'production') {
    logger.error('Seed não pode ser executado em ambiente de produção.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const configService = app.get(ConfigService);
  const usuariosService = app.get(UsuariosService);

  const email = configService.get<string>('SEED_ADMIN_EMAIL');
  const senha = configService.get<string>('SEED_ADMIN_PASSWORD');

  if (!email || !senha) {
    logger.error(
      'Variáveis SEED_ADMIN_NAME, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD são obrigatórias no .env.',
    );
    await app.close();
    process.exit(1);
  }

  const existing = await usuariosService.buscarPorEmail(email);

  if (existing) {
    logger.log(`Usuário admin já existe (${email}). Nenhuma ação realizada.`);
  } else {
    await usuariosService.criar({ email, senha });
    logger.log(`Usuário admin criado com sucesso: ${email}`);
  }

  await app.close();
}

void seed();
