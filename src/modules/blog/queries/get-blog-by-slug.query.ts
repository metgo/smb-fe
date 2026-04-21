import { Locale } from 'src/common/enum';

export class GetBlogBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly locale: Locale = Locale.HEBREW,
  ) {}
}
