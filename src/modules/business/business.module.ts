import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController } from 'src/modules/business/controllers/business.controller';
import { BusinessService } from 'src/modules/business/services/business.service';
import { BusinessSchema } from './schema/business.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { MockDataModule } from 'src/modules/mock-data/mock-data.modules';
import { UserSchema } from '../users/schema/users.schema';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { ConfigModule } from 'src/services/config/config.module';
import { MailModule } from 'src/services/mail/mail.module';
import { HashModule } from 'src/services/hash/hash.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import {
  BussCategory,
  BussCategorySchema,
} from '../buss-categories/schema/buss.category.schema';
import {
  BussSubCategory,
  BussSubCategorySchema,
} from '../buss-subcategories/schema/buss-subCategory.schema';
import { Product, ProductSchema } from '../products/schema/products.schema';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BusinessAuditSchema } from 'src/modules/business/schema/business-audit.schema';
import { EventsService } from 'src/modules/business/services/event.service';
import { MediaModule } from 'src/modules/media/media.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: 'User', schema: UserSchema },
      { name: 'DMO', schema: DMOSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: 'BusinessAudit', schema: BusinessAuditSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => CampaignModule),
    ConfigModule,
    forwardRef(() => ExternalApiModule),
    MailModule,
    HashModule,
    MockDataModule,
    MailChimpModule,
    MediaModule,
    BankAccountModule,
    forwardRef(() => VoucherModule),
    forwardRef(() => UsersModule),
    forwardRef(() => DMOModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, EventsService],
  exports: [BusinessService],
})
export class BusinessModule {}
