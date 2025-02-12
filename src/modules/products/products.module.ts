import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    forwardRef(() => AuthorityModule),
    CartModule,
    forwardRef(() => MockDataModule),
    forwardRef(() => DMOModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
    forwardRef(() => CampaignModule),
    forwardRef(() => ExternalApiModule),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
