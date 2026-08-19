import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validador para datas civis puras no formato YYYY-MM-DD (sem horário ou fuso).
 * Valida a estrutura (YYYY-MM-DD) e se os valores formam uma data real no calendário.
 */
export function IsDateOnly(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateOnly',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }

          // 1. Validação do padrão textual YYYY-MM-DD
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          if (!regex.test(value)) {
            return false;
          }

          // 2. Validação se a data é real no calendário gregoriano (evita 2026-02-30, etc.)
          const partes = value.split('-').map(Number);
          const ano = partes[0];
          const mes = partes[1];
          const dia = partes[2];

          if (mes < 1 || mes > 12) {
            return false;
          }

          const data = new Date(ano, mes - 1, dia);

          return (
            data.getFullYear() === ano &&
            data.getMonth() === mes - 1 &&
            data.getDate() === dia
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `O campo ${args.property} deve ser uma data válida no formato YYYY-MM-DD`;
        },
      },
    });
  };
}
