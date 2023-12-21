import { UserType } from '../users/users.type';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface OtpToken {
  otpToken: string
}

export interface IPayload {
  id: string;
  fullName: string;
  email: string;
}

export interface IJWTUser {
  _id: string;
  fullName: string;
  email: string;
  password:string;
  isPhoneVerify: boolean,
  isEmailVerify: boolean,
  role: string;
  hasBusiness: boolean,
  iat: number;
  exp: number;
}

export interface IJWTOtp {
  id: string;
  code: string;
  expireDate: Date;
  isv:string;
  isVerify: boolean,
  userId: string,
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
