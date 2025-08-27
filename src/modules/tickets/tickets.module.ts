import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { TicketController } from './controller/tickets.controller';
import { Ticket, TicketSchema } from './schema/tickets.schema';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { CampaignModule } from '../campaign/campaign.module';
import { GetTicketByIdsHandler } from './queries/handler/get-ticket-by-ids.handler';
import { GetTicketByIdHandler } from './queries/handler/get-ticket-by-id.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    UsersModule,
    AuthorityModule,
    DMOModule,
    GcpBucketModule,
    CampaignModule,
  ],
  controllers: [TicketController],
  providers: [GetTicketByIdHandler, GetTicketByIdsHandler],
})
export class TicketModule {}
