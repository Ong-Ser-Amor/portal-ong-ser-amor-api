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
        validate(value: any, args: ValidationArguments) {
          // Tipa o array de constraints afirmando que é uma string
          const relatedPropertyName = args.constraints[0] as string;

          // Tipa o object como um Record seguro para pegar chaves dinâmicas
          const objectRecord = args.object as Record<string, unknown>;
          const relatedValue = objectRecord[relatedPropertyName];

          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return true;
          }

          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          return `O campo ${args.property} não pode ser anterior a ${relatedPropertyName}`;
        },
      },
    });
  };
}
