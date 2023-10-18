import {
  ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line no-unused-vars
  async validate(email: any, args?: ValidationArguments) {
    if (!email) {
      return true;
    }
    if (typeof email !== 'string') {
      return true;
    }

    return false;
  }
}

export function IsEmailAlreadyExist(validationOption?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOption,
      constraints: [],
      validator: IsEmailAlreadyExistConstraint,
    });
  };
}
