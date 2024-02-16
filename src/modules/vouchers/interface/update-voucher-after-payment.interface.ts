import mongoose from 'mongoose';
import { Locale } from 'src/common/enum';

export interface UpdateVoucherAfterPaymentInterface {
    ids: mongoose.Types.ObjectId[],
    updateField: object,
    voucherOwnerName: string,
    voucherOwnerEmail: string,
    languagePreference: Locale,
}
