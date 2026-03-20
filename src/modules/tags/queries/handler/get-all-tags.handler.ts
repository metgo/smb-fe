import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetAllTagsQuery } from '../get-all-tags.query';
import { Tags } from '../../schema/tags.schema';

@QueryHandler(GetAllTagsQuery)
export class GetAllTagsHandler implements IQueryHandler<GetAllTagsQuery> {
  constructor(
    @InjectModel(Tags.name)
    private TagsModel: Model<Tags>,
  ) {}

  async execute(query: GetAllTagsQuery): Promise<any> {
    const { search } = query;

    let findQuery: any = {};

    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { nameHe: { $regex: search, $options: 'i' } },
          { nameAr: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const select = '_id name nameHe nameAr';

    const tags = await this.TagsModel.find(findQuery).select(select);

    return tags;
  }
}
