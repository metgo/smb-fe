import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FindByIdAndPopulateQuery } from '../find-by-id-and-populate.query';
import { Order } from '../../schema/orders.schema';

@QueryHandler(FindByIdAndPopulateQuery)
export class FindByIdAndPopulateHandler
implements IQueryHandler<FindByIdAndPopulateQuery> {
  constructor(
    @InjectModel(Order.name)
    private readonly OrderModel: Model<Order>,
  ) {}

  async execute(query: FindByIdAndPopulateQuery): Promise<Order> {
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
    if (query.populate?.campaign) {
      populate.push({
        path: 'campId',
        select: 'name',
        populate: {
          path: 'themeId',
          select:
            'primaryColor secondaryColor faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo',
        },
      });
    }

    if (query.populate?.user) {
      populate.push({
        path: 'userId',
        select: 'firstName',
      });
    }

    if (query.populate?.products) {
      populate.push({
        path: 'products.id',
        select: 'name',
        populate: {
          path: 'businessId',
          select: 'name busiEmail phoneNumber countryCode',
        },
      });
    }

    const order = await this.OrderModel.findById(query.id).populate(populate);
    return order;
  }
}
