import { Locale } from 'src/common/enum';
import { UserType } from 'src/modules/users/users.type';

export interface LoggedInUserInterface {
  id: string;
  firstName: string;
  lastName: string;
  phoneDetails: {
    countryCode: string;
    phoneNumber: string;
  };
  languagePreference: Locale;
  address: string;
  dob: Date;
  email: string;
  isPhoneVerify: boolean;
  isEmailVerify: boolean;
  role: UserType;
  hasBusiness: boolean;
  dmo: null | { id: string; name: string };
}

export interface LoginInterface {
  accessToken: string;
  refreshToken: string;
  user: LoggedInUserInterface;
}
