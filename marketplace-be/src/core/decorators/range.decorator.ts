import { registerDecorator, ValidationOptions } from 'class-validator';

export function AmountRange(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'amount',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const amount = parseFloat(value);
          return !Number.isNaN(amount) && amount >= min && amount <= max;
        },
        defaultMessage() {
          return `Amount should be between ${min} and ${max}`;
        },
      },
    });
  };
}
