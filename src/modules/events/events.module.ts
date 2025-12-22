import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/modules/users/users.module';
import { EventController } from './controllers/events.controllers';
import { EventSchema } from './schema/events.schema';
import { MediaModule } from '../media/media.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { GetAllEventsHandler } from './queries/handler/get-all-events.handler';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { GetEventBySlugHandler } from './queries/handler/get-event-by-slug.handler';
import { CampaignModule } from '../campaign/campaign.module';
import { GetSearchRecommendationTourismHandler } from './queries/handler/get-search-recommendation.handler';
import { GetAllEventsRawQueryHandler } from './queries/handler/get-all-events-rawquery.handler';
import { GetEventsByIdHandler } from './queries/handler/get-by-ids.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    UsersModule,
    MediaModule,
    AuthorityModule,
    DMOModule,
    GcpBucketModule,
    CampaignModule,
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
