import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { ConfigModule } from 'src/services/config/config.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { MockDataModule } from 'src/modules/mock-data/mock-data.modules';
import {
  Product,
  ProductSchema,
} from 'src/modules/products/schema/products.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { ProductsController } from 'src/modules/products/products.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { MediaModule } from 'src/modules/media/media.module';
import { CartModule } from '../cart/cart.modules';
import {
  BussCategory,
  BussCategorySchema,
} from '../buss-categories/schema/buss.category.schema';
import { Tags, TagsSchema } from 'src/modules/tags/schema/tags.schema';
import { GetAllProductsForMapHandler } from './queries/handler/get-all-products-for-map.handler';
import { GetAllProductsRawQueryHandler } from './queries/handler/get-all-products-raw-query.handler';
import { GetAllProductsHandler } from './queries/handler/get-all-products.handler';
import { GetProductsDeliveryHandler } from './queries/handler/get-products-delivery.handler';
import { GetAllProductsByBusinessIdHandler } from './queries/handler/get-all-product-by-businessId.handler';
import {
  ProductsAudit,
  ProductsAuditSchema,
} from './schema/products-audit.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: BussCategory.name,
        schema: BussCategorySchema,
      },
      {
        name: Tags.name,
        schema: TagsSchema,
      },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
    ]),
    ConfigModule,
    forwardRef(() => AuthorityModule),
    CartModule,
    forwardRef(() => MockDataModule),
    forwardRef(() => DMOModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
    forwardRef(() => CampaignModule),
    forwardRef(() => ExternalApiModule),
  ],
  providers: [
    ProductsService,
    GetAllProductsHandler,
    GetAllProductsForMapHandler,
    GetAllProductsRawQueryHandler,
    GetProductsDeliveryHandler,
    GetAllProductsByBusinessIdHandler,
  ],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
