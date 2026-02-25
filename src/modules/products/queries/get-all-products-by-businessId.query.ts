import { Locale } from 'src/common/enum';

export class GetAllProductsByBusinessIdQuery {
  constructor(
    public readonly businessId: string,
    public readonly locale: Locale,
  ) {}
}
