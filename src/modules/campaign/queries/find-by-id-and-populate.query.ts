export class FindByIdAndPopulateQuery {
  public readonly id: string;
  public readonly populate: {
    externalApi?: boolean;
  };

  constructor(
    id: string,
    populate: Partial<FindByIdAndPopulateQuery['populate']> = {},
  ) {
    this.id = id;
    this.populate = populate;
  }
}
