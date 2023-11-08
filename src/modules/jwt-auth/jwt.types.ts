import { UserType } from '../users/users.type';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
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

export interface ITokenUser {
  email: string;
  id: string;
  role: UserType,
  hasBusiness: boolean
}
