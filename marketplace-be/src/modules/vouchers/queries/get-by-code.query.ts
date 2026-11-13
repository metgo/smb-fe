import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { GetVoucherByCodeQuery } from '../dto/get-by-code.query';

export class GetByCodeQuery {
  constructor(
    public readonly code: string,
    public readonly queryData: GetVoucherByCodeQuery,
    public readonly loggedInUser?: LoggedInUserInterface,
  ) {}
}
