import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DMOSchema } from './schema/dmo.schema';
import { DMOService } from './dmo.service';
import { DMOController } from './dmo.controller';
import { UserSchema } from '../users/schema/users.schema';
import { UsersService } from '../users/users.services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DMO', schema: DMOSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [DMOService, UsersService],
  controllers: [DMOController],
})
export class DMOModule {}
