import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  const logger = new Logger('Seed');

  if (process.env.NODE_ENV === 'production') {
    logger.error('Seed não pode ser executado em ambiente de produção.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  const name = configService.get<string>('SEED_ADMIN_NAME');
  const email = configService.get<string>('SEED_ADMIN_EMAIL');
  const password = configService.get<string>('SEED_ADMIN_PASSWORD');

  if (!name || !email || !password) {
    logger.error(
      'Variáveis SEED_ADMIN_NAME, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD são obrigatórias no .env.',
    );
    await app.close();
    process.exit(1);
  }

  const existing = await usersService.findOneByEmail(email);

  if (existing) {
    logger.log(`Usuário admin já existe (${email}). Nenhuma ação realizada.`);
  } else {
    await usersService.create({ name, email, password });
    logger.log(`Usuário admin criado com sucesso: ${email}`);
  }

  await app.close();
}

void seed();
