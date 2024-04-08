import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityController } from 'src/modules/authority/authority.controller';
import { AuthorityService } from 'src/modules/authority/authority.service';
import {
  Authority,
  AuthoritySchema,
} from 'src/modules/authority/schema/authority.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Authority.name, schema: AuthoritySchema },
    ]),
    DMOModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthorityController],
  providers: [AuthorityService],
  exports: [AuthorityService],
})
export class AuthorityModule {}
