import { OTPPurpose, UserType } from '../users/users.type';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface OtpToken {
  otpToken: string
}

export interface IJWTOtp {
  id: string;
  code: string;
  expireDate: Date;
  isv:string;
  isVerify: boolean,
  userId: string,
  purpose?: OTPPurpose,
  iat: number;
  exp: number;
}

export interface ITokenUser {
  email: string;
  id: string;
  role: UserType,
  hasBusiness: boolean
}

export interface ITokenOtp {
  id: string;
  email: string;
  code: string,
}
