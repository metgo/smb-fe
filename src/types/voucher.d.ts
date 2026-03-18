type VoucherStatus =
  | "ACTIVE"
  | "ASSIGNED"
  | "REDEEMED"
  | "EXPIRED"
  | "CANCELED"
  | "UNASSIGNED";
interface Voucher {
  _id: string;
  campId: string;
  status: VoucherStatus;
  amount: number;
  remainingAmount: number;
  paymentStatus: string;
  code: string;
  expireDate: string; // ISO string date
  creatorInfo: {
    id: {
      externalApiId: string | null;
      _id: string;
      firstName: string;
      lastName: string;
      dob: string | null;
      email: string;
      language_preference: string;
      password: string;
      isPhoneVerify: boolean;
      isEmailVerify: boolean;
      loginAttempts: number;
      role: string;
      hasBusiness: boolean;
      createdAt: string;
      updatedAt: string;
      lastLogin: string;
      countryCode: string;
      phoneNumber: string;
      languagePreference: string;
      bankAccountId: string | null;
      address: string;
      isDeleted: boolean;
    };
    createdAt: string;
  };
  assigneeInfo: {
    name: string | null;
    countryCode: string | null;
    phone: string | null;
    email: string | null;
    assignedAt: string | null;
    id: string | null;
  };
  purchaserInfo: {
    id: {
      bankAccountId: string | null;
      _id: string;
      createdAt: string;
      updatedAt: string;
      isDeleted: boolean;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      address: string;
      dob: string | null;
      email: string;
      languagePreference: string;
      password: string;
      isPhoneVerify: boolean;
      isEmailVerify: boolean;
      loginAttempts: number;
      role: string;
      hasBusiness: boolean;
      externalApiId: string | null;
      lastLogin: string;
      countryCode: string;
    };
    countryCode: string | null;
    email: string;
  };
}
