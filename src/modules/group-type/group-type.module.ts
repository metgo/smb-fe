import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupTypeSchema } from './schema/group-type.schema';
import { GroupTypeController } from './group-type.controller';
import { GroupTypeService } from './group-type.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'GroupType', schema: GroupTypeSchema }]),
    UsersModule,
  ],
  controllers: [GroupTypeController],
  providers: [GroupTypeService],
})
export class GroupTypeModule {}
