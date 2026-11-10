import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FindByIdAndPopulateQuery } from '../find-by-id-and-populate.query';
import { ExternalApi } from '../../schema/external-api.schema';

@QueryHandler(FindByIdAndPopulateQuery)
export class FindByIdAndPopulateHandler
implements IQueryHandler<FindByIdAndPopulateQuery> {
  constructor(
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: FindByIdAndPopulateQuery): Promise<ExternalApi> {
    const populate = [];
    if (query.populate?.theme) {
      populate.push({
        path: 'themeId',
        select:
          'primaryColor secondaryColor faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo',
      });
    }

    const externalApi = await this.ExternalApiModel.findById(query.id).populate(
      populate,
    );
    return externalApi;
  }
}
