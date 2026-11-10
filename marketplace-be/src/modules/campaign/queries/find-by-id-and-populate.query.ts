import { ObjectId } from 'typeorm';

export class FindByIdAndPopulateQuery {
  public readonly id: string | ObjectId;
  public readonly populate: {
    externalApi?: boolean;
  };

  constructor(
    id: string | ObjectId,
    populate: Partial<FindByIdAndPopulateQuery['populate']> = {},
  ) {
    this.id = id;
    this.populate = populate;
  }
}
