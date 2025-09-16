import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<string>('API_PORT', process.env.PORT) || 3000;
  const host =
    configService.get<string>('API_HOST', process.env.HOST) || 'localhost';

  const config = new DocumentBuilder()
    .setTitle('Portal ONG Ser Amor API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(port);

  Logger.log(
    `🚀 Aplicação está rodando em: http://${host}:${port}`,
    'Bootstrap',
  );
}
bootstrap();
