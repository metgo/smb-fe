import mongoose from 'mongoose';
import { Currency, Locale } from 'src/common/enum';

/* eslint-disable no-shadow */
export enum PaymentPurpose {
    VOUCHER = 'VOUCHER_PAYMENT',
    ORDER = 'ORDER_PAYMENT',
}

export interface GenerateLinkCommand {
    amount: number,
    currency: Currency,
    purpose: PaymentPurpose,
    id: [mongoose.Types.ObjectId] | mongoose.Types.ObjectId,
    customerEmail: string,
    customerName: string,
    languagePreference: Locale,
}
