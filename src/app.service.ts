import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      message: 'Bem-vindo à API do Portal ONG Ser Amor',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      documentation: {
        swagger: '/api',
        description: 'Documentação Swagger da API',
      },
    };
  }
}
