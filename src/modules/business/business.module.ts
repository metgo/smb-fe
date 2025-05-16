import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController } from 'src/modules/business/controllers/business.controller';
import { BusinessService } from 'src/modules/business/services/business.service';
import { BusinessSchema } from './schema/business.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ConfigModule } from 'src/services/config/config.module';
import { HashModule } from 'src/services/hash/hash.module';
import { Product, ProductSchema } from '../products/schema/products.schema';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BusinessAuditSchema } from 'src/modules/business/schema/business-audit.schema';
import { EventsService } from 'src/modules/business/services/event.service';
import { MediaModule } from 'src/modules/media/media.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GetAllBusinessForMapHandler } from './queries/handler/get-all-business-for-map.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
      { name: 'BusinessAudit', schema: BusinessAuditSchema },
    ]),
    ConfigModule,
    HashModule,
    MediaModule,
    BankAccountModule,
    forwardRef(() => VoucherModule),
    forwardRef(() => UsersModule),
    forwardRef(() => DMOModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, EventsService, GetAllBusinessForMapHandler],
  exports: [BusinessService],
})
export class BusinessModule {}
