import mongoose from 'mongoose';
import { Currency, Locale } from 'src/common/enum';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';

/* eslint-disable no-shadow */
export enum PaymentPurpose {
  VOUCHER = 'VOUCHER_PAYMENT',
  ORDER = 'ORDER_PAYMENT',
}

export interface GenerateLinkCommand {
  amount: number;
  currency: Currency;
  purpose: PaymentPurpose;
  id: [mongoose.Types.ObjectId] | mongoose.Types.ObjectId;
  customerEmail: string;
  customerName: string;
  languagePreference: Locale;
}

export interface InvoiceCommand {
  customerName: string;
  customerEmail: string;
  invoiceType: number;
  product?: {
    id: string;
    name: string;
    price: number;
  }[];
  voucherDetails?: Voucher[];
  transactionId: number;
  purpose: PaymentPurpose;
  sumPaid: number;
  languagePreference: Locale;
  additionalInformation: string;
}
