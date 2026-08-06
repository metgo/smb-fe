import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { localizeItem } from 'src/common/localise-items';
import { GetEventBySlugQuery } from '../get-event-by-slug.query';
import { TicketStatus } from 'src/modules/tickets/tickets.type';
import { GetAllTicketsQuery } from 'src/modules/tickets/queries/get-all-tickets.query';
import { GetAllTicketsRequest } from 'src/modules/tickets/requests/get-all-tickets.request';
import { EventsAudit } from '../../schema/events-audit.schema';
import { sanitizeImages } from 'src/core/helper/image.util';

function localizeAccessibility(item: any, locale: Locale) {
  const { hebrewName, ...rest } = item;
  return {
    ...rest,
    name: locale === Locale.HEBREW ? hebrewName || rest.name : rest.name,
  };
}

function sanitizeTicket(ticket: any) {
  const {
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
    deletedBy,
    deletedAt,
    isDeleted,
    userId,
    __v,
    ...rest
  } = ticket;
  return rest;
}

@QueryHandler(GetEventBySlugQuery)
export class GetEventBySlugHandler
implements IQueryHandler<GetEventBySlugQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(queries: GetEventBySlugQuery): Promise<any> {
    try {
      const { slug, query } = queries;
      const { locale } = query;

      const today = new Date();

      today.setUTCHours(0, 0, 0, 0);

      const baseEventFilter: any = {
        slug,
        status: CommonStatus.APPROVED,
        dayDescription: {
          $elemMatch: {
            date: {
              $gte: today,
            },
          },
        },
        isDeleted: { $ne: true },
      };

      const populate = [
        {
          path: 'groupTypesId accessibilitiesId',
          select: '_id name hebrewName',
        },
      ];

      const select
        = '_id location cover images cover name nameHe nameAr address countryCode phoneNumber shortDescription description shortDescriptionHe descriptionHe shortDescriptionAr descriptionAr contactDetails geoLocation groupTypesId accessibilitiesId subCategoriesId slug hasExternalTicket ticketBuyLink dayDescription payment eventId';

      // First try the latest audit doc with isActive: true
      let event = await this.EventsAuditModel.findOne({
        ...baseEventFilter,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .populate(populate)
        .lean()
        .select(select);

      // If no isActive doc found, fall back to the latest audit doc regardless of isActive
      if (!event) {
        event = await this.EventsAuditModel.findOne(baseEventFilter)
          .sort({ createdAt: -1 })
          .populate(populate)
          .lean()
          .select(select);
      }

      if (!event) {
        throw new NotFoundException(ServerErrors.EVENT.NOT_FOUND);
      }

      const ticketRequest = new GetAllTicketsRequest();
      ticketRequest.eventId = event.eventId.toString();
      ticketRequest.status = TicketStatus.ACTIVE;
      const tickets = await this.queryBus.execute(
        new GetAllTicketsQuery(ticketRequest),
      );

      const {
        eventId, groupTypesId, accessibilitiesId, ...rest
      } = event;

      const localizedEvent: any = await localizeItem(rest, locale);

      const newEvent = {
        ...localizedEvent,
        _id: eventId,
        images: sanitizeImages(rest.images),
        groupTypesId: (groupTypesId || []).map(item => localizeAccessibility(item, locale)),
        accessibilitiesId: (accessibilitiesId || []).map(item => localizeAccessibility(item, locale)),
        payment: {
          ticketIds: tickets.map(sanitizeTicket),
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
