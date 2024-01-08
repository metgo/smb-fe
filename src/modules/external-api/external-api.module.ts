import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExternalApiController } from 'src/modules/external-api/external-api.controller';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { ExternalApi, ExternalApiSchema } from 'src/modules/external-api/schema/external-api.schema';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalApi.name, schema: ExternalApiSchema },
    ]),
    UsersModule,
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiServices],
})
export class ExternalApiModule {}
