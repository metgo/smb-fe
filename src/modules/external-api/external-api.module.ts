import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiController } from 'src/modules/external-api/controllers/external-api.controller';
import { ExternalAPIServiceController } from 'src/modules/external-api/controllers/external-api-services.controller';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalApi.name, schema: ExternalApiSchema },
    ]),
    AuthModule,
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  controllers: [ExternalApiController, ExternalAPIServiceController],
  providers: [ExternalApiServices],
})
export class ExternalApiModule {}
