import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { updateAssignedUserVoucherDto } from 'src/modules/vouchers/dto';

export interface AssignVoucherCommand {
  loggedInUser: LoggedInUserInterface;
  body: updateAssignedUserVoucherDto;
  query: string;
}
