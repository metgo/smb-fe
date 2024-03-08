// eslint-disable-next-line no-shadow
export enum UserType {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  TRAVELLER = 'traveller',
  DMO = 'dmo',
  DMOADMIN = 'dmoadmin',
}

export interface phoneDetails {
  countryCode: string;
  phoneNumber: string;
}

export interface UpdateLastLogin {
  lastLogin?: Date;
  loginAttempts: number;
}

// eslint-disable-next-line no-shadow
export enum OTPPurpose {
  FORGET_PASSWORD = 'forgetPassword',
  RECOVER_ACCOUNT = 'recoverAccount',
  UNBLOCK_ACCOUNT = 'unblockAccount',
}
