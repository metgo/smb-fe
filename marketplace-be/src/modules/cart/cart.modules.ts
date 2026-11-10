import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/modules/users/users.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { Cart, CartSchema } from 'src/modules/cart/cart.schema';
import { CartController } from 'src/modules/cart/cart.controller';
import { CartService } from 'src/modules/cart/cart.service';
import { ProductsModule } from 'src/modules/products/products.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => CampaignModule),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
