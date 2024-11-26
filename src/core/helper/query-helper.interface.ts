import { Locale, SortOrder } from 'src/common/enum';

export interface QueryHelperInterface {
  findQuery: {};
  select: string | {};
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: SortOrder;
  populate?: any;
  populate1?: any;
  languageQuery?: Locale;
}
