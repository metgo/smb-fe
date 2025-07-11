import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetEventBySlugQuery } from '../get-event-by-slug.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { EventStatus } from '../../events.type';

@QueryHandler(GetEventBySlugQuery)
export class GetEventBySlugHandler
implements IQueryHandler<GetEventBySlugQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Event.name)
    private EventModel: Model<Event>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetEventBySlugQuery): Promise<any> {
    try {
      const { slug, query } = queries;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        query.campCode,
      );

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return {};
      }

      let findQuery: any = {
        slug,
        status: EventStatus.APPROVED,
      };

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      }

      if (orConditions.length) {
        findQuery = {
          ...findQuery,
          $or: orConditions,
        };
      }

      const populate = [
        {
          path: 'dayDescription.ticketIds payment.ticketIds',
          select: 'name images price status userId',
        },
        {
          path: 'groupTypesId accessibilitiesId',
          select: '_id name hebrewName',
        },
      ];

      const select
        = '_id location cover images logo name address countryCode phoneNumber shortDescription description contactDetails geoLocation groupTypesId accessibilitiesId subCategoriesId slug dayDescription payment';

      const event = await this.EventModel.findOne(findQuery)
        .populate(populate)
        .select(select);
      if (!event) {
        throw new NotFoundException(ServerErrors.EVENT.NOT_FOUND);
      }

      return event;
    } catch (err) {
      this.logger.error('[EVENT]: FAILED TO FETCH EVENT', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
