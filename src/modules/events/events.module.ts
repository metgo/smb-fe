import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/modules/users/users.module';
import { EventController } from './controllers/events.controllers';
import { EventSchema } from './schema/events.schema';
import { MediaModule } from '../media/media.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { ConfigModule } from 'src/services/config/config.module';
import { GetAllEventsHandler } from './queries/handler/get-all-events.handler';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { GetEventBySlugHandler } from './queries/handler/get-event-by-slug.handler';
import { CampaignModule } from '../campaign/campaign.module';
import { GetSearchRecommendationTourismHandler } from './queries/handler/get-search-recommendation.handler';
import { GetAllEventsRawQueryHandler } from './queries/handler/get-all-events-rawquery.handler';
import { GetEventsByIdHandler } from './queries/handler/get-by-ids.handler';
import { EventsAudit, EventsAuditSchema } from './schema/events-audit.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: EventsAudit.name, schema: EventsAuditSchema },
    ]),
    UsersModule,
    MediaModule,
    AuthorityModule,
    DMOModule,
    GcpBucketModule,
    CampaignModule,
    ConfigModule,
  ],
  controllers: [EventController],
  providers: [
    GetAllEventsHandler,
    GetEventBySlugHandler,
    GetSearchRecommendationTourismHandler,
    GetAllEventsRawQueryHandler,
    GetEventsByIdHandler,
  ],
})
export class EventsModule {}
