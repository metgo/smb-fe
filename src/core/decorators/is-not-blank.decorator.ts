import { ValidationOptions, registerDecorator } from 'class-validator';
import { ServerErrors } from 'src/common/constant';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return typeof value === 'string' && value.trim() !== '';
        },
        defaultMessage() {
          return `${propertyName.toUpperCase()} ${ServerErrors.IS_NOT_BLANK}`;
        },
      },
    });
  };
}
