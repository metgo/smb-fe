import {
  ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator,
} from 'class-validator';
import { BusinessService } from 'src/modules/business/business.service';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly businessService: BusinessService) { }
  // eslint-disable-next-line no-unused-vars
  async validate(email: any, args?: ValidationArguments) {
    console.log('tests', email);
    if (!email) {
      return true;
    }
    if (typeof email !== 'string') {
      return true;
    }
    //   console.log(this.businessService.findBusinessEmail(email));
    // const bussemail = await this.businessService.findBusinessEmail(email);

    return false;
  }
}

export function IsEmailAlreadyExist(validationOption?: ValidationOptions) {
  console.log('test', validationOption);
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
