export class NotifyNoResultCommand {
  constructor(
    public readonly keyword: string,
    public readonly websiteUrl?: string,
  ) {}
}
