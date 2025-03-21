import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';

export class GetByCodeQuery {
  constructor(
    public readonly code: string,
    public readonly campCode: string,
    public readonly loggedInUser?: LoggedInUserInterface,
  ) {}
}
