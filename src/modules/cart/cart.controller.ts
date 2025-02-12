import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { CartService } from 'src/modules/cart/cart.service';
import { AddToCartDto } from 'src/modules/cart/dto/add-to-cart.dto';
import { UpdateCartDto } from 'src/modules/cart/dto/update-cart.dto';

@Controller()
export class CartController {
  constructor(private cartService: CartService) {}

  @ApiEndpoint({
    tags: ['Cart'],
    operation: 'Create cart',
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.CART.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('carts')
  async addToCart(@Body() body: AddToCartDto, @Req() req) {
    const cart = await this.cartService.createCart(body, req?.user);
    return cart;
  }

  @ApiEndpoint({
    tags: ['Cart'],
    operation: 'Update item of cart',
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CART.UPDATED,
    },
    params: [
      {
        name: 'cartId',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch('carts/:cartId')
  async updateCart(
    @Body() body: UpdateCartDto,
    @Param('cartId') cartId: string,
    @Req() req,
  ) {
    const updatedCart = await this.cartService.updateCart(
      cartId,
      body,
      req?.user,
    );
    return updatedCart;
  }

  @ApiEndpoint({
    tags: ['Cart'],
    operation: 'Get cart information',
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CART.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('carts/:cartId')
  async getCart(@Param('cartId') cartId: string) {
    const cart = await this.cartService.findOneById(cartId);

    return cart;
  }

  @ApiEndpoint({
    tags: ['Cart'],
    operation: 'Delete cart',
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CART.UPDATED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Delete('carts/:cartId')
  async deleteCart(@Param('cartId') cartId: string, @Req() req) {
    const deletedCart = await this.cartService.deleteCart(cartId, req?.user);

    return deletedCart;
  }
}
