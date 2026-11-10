import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateOrderDto } from '../dto';

export class CreateMiniSiteOrderCommand {
  constructor(
    public readonly body: CreateOrderDto,
    public readonly loggedInUser?: LoggedInUserInterface,
  ) {}
}
