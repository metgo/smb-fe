import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FindByIdAndPopulateQuery } from '../find-by-id-and-populate.query';
import { Campaign } from '../../schema/campaign.schema';

@QueryHandler(FindByIdAndPopulateQuery)
export class FindByIdAndPopulateHandler
implements IQueryHandler<FindByIdAndPopulateQuery> {
  constructor(
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
  ) {}

  async execute(query: FindByIdAndPopulateQuery): Promise<Campaign> {
    const populate = [];
    if (query.populate?.externalApi) {
      populate.push({
        path: 'externalApiId',
        select: 'name identifierId',
        populate: {
          path: 'themeId',
          select:
            'primaryColor secondaryColor faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo',
        },
      });
    }

    const campaign = await this.CampaignModel.findById(query.id).populate(
      populate,
    );
    return campaign;
  }
}
