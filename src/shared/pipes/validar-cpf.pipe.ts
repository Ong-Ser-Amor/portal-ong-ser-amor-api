import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidarCpfPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || typeof value !== 'string' || !/^\d{11}$/.test(value)) {
      throw new BadRequestException(
        'O CPF deve conter exatamente 11 dígitos numéricos.',
      );
    }
    return value;
  }
}
