import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from 'src/services/config/config.module';
import { DMOModule } from '../dmo/dmo.module';
import { CampaignSegmentController } from './campaignSegment.controller';
import { CampaignSegmentSchema } from './schema/campaignSegment.schema';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { ConfigService } from 'src/services/config/config.service';
import { UsersModule } from '../users/users.module';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { BusinessModule } from 'src/modules/business/business.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { CampaignSegmentService } from 'src/modules/campaign-segments/campaignSegment.service';
import { ProductsModule } from 'src/modules/products/products.module';

const configService = new ConfigService();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CampaignSegment', schema: CampaignSegmentSchema },
      { name: 'DMO', schema: DMOSchema },
    ]),
    forwardRef(() => UsersModule),
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    ConfigModule,
    DMOModule,
    forwardRef(() => CampaignModule),
    BusinessModule,
    ProductsModule,
  ],
  providers: [
    CampaignSegmentService,
  ],
  controllers: [CampaignSegmentController],
  exports: [CampaignSegmentService],
})
export class CampaignSegmentModule { }
