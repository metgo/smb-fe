import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSchema } from './schema/business.schema';
import { UsersService } from '../users/users.services';
import { UserSchema } from '../users/schema/users.schema';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { DMOService } from '../dmo/dmo.service';
import { MailModule } from 'src/services/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: 'User', schema: UserSchema },
      { name: 'DMO', schema: DMOSchema },
    ]),
    MailModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService, UsersService, DMOService],
  exports: [BusinessService],
})
export class BusinessModule {}
