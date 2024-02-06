import { Locale } from 'src/common/enum';

export interface QueryHelperInterface {
    findQuery: {},
    select: string | {},
    page: number,
    limit: number,
    sort?: string,
    populate?: any,
    populate1?: any,
    languageQuery ?: Locale,
}
