export class GetSiteSettingSeoQuery {
  constructor(
    public readonly identifierId: string,
    public readonly locale: string = 'en',
  ) {}
}
