export class GetSiteSettingSocialContactQuery {
  constructor(
    public readonly identifierId: string,
    public readonly locale: string = 'en',
  ) {}
}
