interface BankAccountDetails {
  bankNumber?: string;
  branchNumber?: string;
  accountNumber: string;
  bnNumber: string;
  invoiceName: string;
}

type BankAccountErrors = {
  bankNumber?: string;
  branchNumber?: string;
  accountNumber?: string;
  bnNumber?: string;
  invoiceName?: string;
};

interface UserProfilePayload {
  bankNumber?: string;
  branchNumber?: string;
  accountNumber?: string;
  businessNumberByGovt?: string;
  invoiceName?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phoneNumber?: string;
  dob?: string;
  address?: string;
  languagePreference?: string;
}

interface BankBranch {
  branchId: string;
  branchName: string;
}

interface Bank {
  bankId: string;
  bankName: string;
  branches: BankBranch[];
}

interface PhoneDetails {
  countryCode: string;
  phoneNumber: string;
}

interface BankAccount {
  bankNumber: string;
  branchNumber: string;
  accountNumber: string;
  invoiceName: string;
  businessNumberByGovt: string;
}

interface UserInfoRes {
  id: string;
  firstName: string;
  lastName: string;
  phoneDetails: PhoneDetails;
  languagePreference: string;
  dob: string | null;
  email: string;
  address: string;
  isPhoneVerify: boolean;
  isEmailVerify: boolean;
  role: "superadmin" | "admin" | "user" | string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  bankAccount: BankAccount;
  hasBusiness: boolean;
  dmo: string | null;
  authority: string | null;
}

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  email: string;
  language_preference: string;
  isPhoneVerify: boolean;
  isEmailVerify: boolean;
  loginAttempts: number;
  role: "superadmin" | "admin" | "user";
  hasBusiness: boolean;
  lastLogin: string;
  countryCode: string;
  phoneNumber: string;
  languagePreference: string;
  address: string;
}
interface IUsersRes {
  data: IUser[];
  totalData: number;
  meta: {
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
