import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { createVoucherDto } from '../dto';

export class CreateVouchersCommand {
  constructor(
    public readonly body: createVoucherDto,
    public readonly loggedInUser?: LoggedInUserInterface,
  ) {}
}
