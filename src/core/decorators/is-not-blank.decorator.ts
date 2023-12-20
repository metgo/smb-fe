import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';
import { ServerErrors } from 'src/common/constant';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | Number, args: ValidationArguments) {
          if (validationOptions?.each) {
            return value !== null && value !== undefined && value !== 0;
          }
          return typeof value === 'string' && value.trim() !== '';
        },
        defaultMessage() {
          return `${propertyName.toUpperCase()} ${ServerErrors.IS_NOT_BLANK}`;
        },
      },
    });
  };
}
