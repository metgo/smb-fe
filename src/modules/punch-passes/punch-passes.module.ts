import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { BusinessModule } from '../business/business.module';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';
import { PunchPass, PunchPassSchema } from './schema/punch-pass.schema';
import { PunchPassesController } from './controller/punch-passes.controller';
import { GetPunchPassByIdHandler } from './queries/handler/get-punch-pass-by-id.handler';
import { GetAllPunchPassesHandler } from './queries/handler/get-all-punch-passes.handler';
import { PunchPassesService } from './punch-passes.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PunchPass.name, schema: PunchPassSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => BusinessModule),
  ],
  controllers: [PunchPassesController],
  providers: [GetPunchPassByIdHandler, GetAllPunchPassesHandler, PunchPassesService],
  exports: [MongooseModule, PunchPassesService],
})
export class PunchPassesModule {}
