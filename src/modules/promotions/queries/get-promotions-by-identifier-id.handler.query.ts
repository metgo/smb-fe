export class GetPromotionsByIdentifierIdQuery {
  constructor(
    public readonly identifierId: string,
    public readonly locale?: string,
    public readonly placement?: string,
  ) { }
}
