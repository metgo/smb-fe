import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import {
  Campaign,
  CampaignSchema,
} from 'src/modules/campaign/schema/campaign.schema';
import { CampaignController } from 'src/modules/campaign/campaign.controller';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { FindByIdAndPopulateHandler } from './queries/handler/find-by-id-and-populate.handler';
import { GetProductsByCampaignHandler } from './queries/handler/get-products-by-campaign.handler';
import { MiniSiteController } from './mini-site.controller';
import { Voucher, VoucherSchema } from '../vouchers/schema/voucher.schema';
import { ProductsAudit, ProductsAuditSchema } from '../products/schema/products-audit.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Voucher.name, schema: VoucherSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => ExternalApiModule),
    GcpBucketModule,
    forwardRef(() => UsersModule),
    EncryptionModule,
    ConfigModule,
    forwardRef(() => DMOModule),
    RewardsModule,
  ],
  providers: [
    CampaignService,
    FindByIdAndPopulateHandler,
    GetProductsByCampaignHandler,
  ],
  controllers: [CampaignController, MiniSiteController],
  exports: [CampaignService],
})
export class CampaignModule {}
