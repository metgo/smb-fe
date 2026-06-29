import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetEventBySlugQuery } from '../get-event-by-slug.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { TicketStatus } from 'src/modules/tickets/tickets.type';
import { GetAllTicketsQuery } from 'src/modules/tickets/queries/get-all-tickets.query';
import { GetAllTicketsRequest } from 'src/modules/tickets/requests/get-all-tickets.request';
import { EventsAudit } from '../../schema/events-audit.schema';

@QueryHandler(GetEventBySlugQuery)
export class GetEventBySlugHandler
implements IQueryHandler<GetEventBySlugQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private campaignService: CampaignService,
    private readonly queryBus: QueryBus,
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

      const today = new Date();

      today.setUTCHours(0, 0, 0, 0);

      let findQuery: any = {
        slug,
        status: CommonStatus.APPROVED,
        isActive: true,

        dayDescription: {
          $elemMatch: {
            date: {
              $gte: today,
            },
          },
        },

        isDeleted: { $ne: true },
      };

      const orConditions = [];

      // Check if event is in campaign's whitelist
      if (campDetails?.whitelist?.event?.length) {
        orConditions.push({ eventId: { $in: campDetails.whitelist.event } });
      }

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
          path: 'groupTypesId accessibilitiesId',
          select: '_id name hebrewName',
        },
      ];

      const select
        = '_id location cover images cover name nameHe nameAr address countryCode phoneNumber shortDescription description shortDescriptionHe descriptionHe shortDescriptionAr descriptionAr contactDetails geoLocation groupTypesId accessibilitiesId subCategoriesId slug dayDescription payment eventId';

      const event = await this.EventsAuditModel.findOne(findQuery)
        .populate(populate)
        .lean()
        .select(select);
      if (!event) {
        throw new NotFoundException(ServerErrors.EVENT.NOT_FOUND);
      }

      const ticketRequest = new GetAllTicketsRequest();
      ticketRequest.eventId = event.eventId.toString();
      ticketRequest.status = TicketStatus.ACTIVE;
      const tickets = await this.queryBus.execute(
        new GetAllTicketsQuery(ticketRequest),
      );

      const { eventId, ...rest } = event;

      const newEvent = {
        ...rest,
        _id: eventId,
        payment: {
          ticketIds: tickets,
        },
      };
      return newEvent;
    } catch (err) {
      this.logger.error('[EVENT]: FAILED TO FETCH EVENT', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
