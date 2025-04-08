import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiController } from 'src/modules/external-api/controllers/external-api.controller';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';

import { UsersModule } from 'src/modules/users/users.module';

import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { FindByIdAndPopulateHandler } from './queries/handler/find-by-id-and-populate.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: ExternalApi.name, schema: ExternalApiSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => DMOModule),
    GcpBucketModule,
    MailChimpModule,
    forwardRef(() => UsersModule),
    PaymentsModule,
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiServices, FindByIdAndPopulateHandler],
  exports: [ExternalApiServices],
})
export class ExternalApiModule {}
