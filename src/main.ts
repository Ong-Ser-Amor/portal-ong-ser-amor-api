import * as fs from 'fs';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<string>('API_PORT', process.env.PORT) || 3000;
  const host =
    configService.get<string>('API_HOST', process.env.HOST) || 'localhost';

  const cors = {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://portal-ong-ser-amor-next-app.vercel.app',
    ],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  };

  app.enableCors(cors);

  const config = new DocumentBuilder()
    .setTitle('Portal ONG Ser Amor API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { jsonDocumentUrl: 'api-json' });

  // Salva a documentação da API em um arquivo JSON
  // APENAS SE NÃO ESTIVER EM PRODUÇÃO
  const nodeEnv =
    configService.get<string>('NODE_ENV', process.env.NODE_ENV) ||
    'development';

  if (nodeEnv !== 'production') {
    fs.writeFileSync('./api-docs.json', JSON.stringify(document, null, 2));
    Logger.log('📄 Documentação da API salva em ./api-docs.json', 'Bootstrap');
  }

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(port);

  Logger.log(
    `🚀 Aplicação está rodando em: http://${host}:${port}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  Logger.error('❌ Erro ao inicializar a aplicação:', error, 'Bootstrap');
  process.exit(1);
});
