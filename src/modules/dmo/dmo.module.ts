import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOSchema } from './schema/dmo.schema';
import { DMOService } from './dmo.service';
import { DMOController } from './dmo.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'DMO', schema: DMOSchema }]),
    GcpBucketModule,
    UsersModule,
    JwtAuthModule,
    forwardRef(() => AuthorityModule),
  ],
  providers: [DMOService],
  controllers: [DMOController],
  exports: [DMOService],
})
export class DMOModule {}
