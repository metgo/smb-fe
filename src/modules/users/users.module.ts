import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.services';
import { ConfigModule } from 'src/services/config/config.module';
import { MailModule } from 'src/services/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
    MailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
