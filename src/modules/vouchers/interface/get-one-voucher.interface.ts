import { Locale } from 'src/common/enum';

export interface GetOneVoucherInterface {
  code: string;
  productId: string;
  locale: Locale;
}
