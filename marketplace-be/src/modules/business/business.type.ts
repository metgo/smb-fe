import { Locale } from 'src/common/enum';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';

export interface GetBusinessByIdOrSlug {
  id: string;
  loggedInUser?: LoggedInUserInterface;
  locale?: Locale;
}
