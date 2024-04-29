import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { GroupTypeSchema } from './schema/group-type.schema';
import { GroupTypeController } from './group-type.controller';
import { GroupTypeService } from './group-type.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'GroupType', schema: GroupTypeSchema }]),
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  controllers: [GroupTypeController],
  providers: [GroupTypeService],
})
export class GroupTypeModule {}
