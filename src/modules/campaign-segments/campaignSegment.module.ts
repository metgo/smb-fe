import { Module, forwardRef } from '@nestjs/common';
import CampaignSegmentService from './campaignSegment.service';
import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from '../users/users.module';
// import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { DMOModule } from '../dmo/dmo.module';
import { CampaignSegmentController } from './campaignSegment.controller';
import { CampaignSegmentSchema } from './schema/campaignSegment.schema';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/services/config/config.service';
import { UsersModule } from '../users/users.module';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { CampaignModule } from 'src/modules/campaign/campaign.module';

const configService = new ConfigService();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CampaignSegment', schema: CampaignSegmentSchema },
      { name: 'DMO', schema: DMOSchema },
    ]),
    UsersModule,
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    ConfigModule,
    DMOModule,
    forwardRef(() => CampaignModule),
  ],
  providers: [
    CampaignSegmentService,
  ],
  controllers: [CampaignSegmentController],
  exports: [CampaignSegmentService],
})
export class CampaignSegmentModule { }
