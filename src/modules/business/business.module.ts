import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController } from 'src/modules/business/controllers/business.controller';
import { MapPointsController } from 'src/modules/business/controllers/map-point.controller';
import { BusinessService } from 'src/modules/business/services/business.service';
import { MapPointsService } from 'src/modules/business/services/map-point.service';
import { BusinessSchema } from './schema/business.schema';
import { MockDataModule } from 'src/modules/mock-data/mock-data.modules';
import { UsersService } from '../users/users.services';
import { UserSchema } from '../users/schema/users.schema';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { DMOService } from '../dmo/dmo.service';
import { ConfigModule } from 'src/services/config/config.module';
import { MailModule } from 'src/services/mail/mail.module';
import { OTPSchema } from '../users/schema/otp.schema';
import { JwtAuthService } from '../jwt-auth/services/jwt-auth.service';
import { HashModule } from 'src/services/hash/hash.module';
import { Media, MediaSchema } from '../media/schema/media.schema';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: 'User', schema: UserSchema },
      { name: 'OTP', schema: OTPSchema },
      { name: 'DMO', schema: DMOSchema },
      { name: Media.name, schema: MediaSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthorityModule,
    ConfigModule,
    MailModule,
    HashModule,
    GcpBucketModule,
    forwardRef(() => MockDataModule),
    MailChimpModule,
    forwardRef(() => VoucherModule),
  ],
  controllers: [BusinessController, EventController, MapPointsController],
  providers: [
    BusinessService,
    UsersService,
    DMOService,
    JwtAuthService,
    EventsService,
    MapPointsService,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
