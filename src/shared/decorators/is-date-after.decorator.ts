import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;

          // Tipa o object como um Record seguro para pegar chaves dinâmicas
          const objectRecord = args.object as Record<string, unknown>;
          const relatedValue = objectRecord[relatedPropertyName];

          if (!value || !relatedValue) {
            return true;
          }

          const valueStr =
            typeof value === 'string'
              ? value.split('T')[0]
              : value instanceof Date
                ? value.toISOString().split('T')[0]
                : '';

          const relatedStr =
            typeof relatedValue === 'string'
              ? relatedValue.split('T')[0]
              : relatedValue instanceof Date
                ? relatedValue.toISOString().split('T')[0]
                : '';

          if (!valueStr || !relatedStr) {
            return true;
          }

          return valueStr >= relatedStr;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          return `O campo ${args.property} não pode ser anterior a ${relatedPropertyName}`;
        },
      },
    });
  };
}
