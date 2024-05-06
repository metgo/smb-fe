import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController } from 'src/modules/business/controllers/business.controller';
import { MapPointsController } from 'src/modules/business/controllers/map-point.controller';
import { BusinessService } from 'src/modules/business/services/business.service';
import { MapPointsService } from 'src/modules/business/services/map-point.service';
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
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { EventController } from 'src/modules/business/controllers/event.controller';
import { EventsService } from 'src/modules/business/services/event.service';
import { MediaModule } from 'src/modules/media/media.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: 'User', schema: UserSchema },
      { name: 'DMO', schema: DMOSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    forwardRef(() => AuthorityModule),
    ConfigModule,
    MailModule,
    HashModule,
    MockDataModule,
    MailChimpModule,
    MediaModule,
    forwardRef(() => VoucherModule),
    forwardRef(() => UsersModule),
    forwardRef(() => DMOModule),
  ],
  controllers: [BusinessController, EventController, MapPointsController],
  providers: [BusinessService, EventsService, MapPointsService],
  exports: [BusinessService],
})
export class BusinessModule {}
