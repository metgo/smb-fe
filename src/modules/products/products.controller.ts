/* eslint-disable no-undef */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse } from '@nestjs/swagger';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ProductsService } from 'src/modules/products/products.services';
import { GetAllProductsQuery } from 'src/modules/products/requests/get-all-products.query';
import { GetProductsQuery } from 'src/modules/products/queries/get-product.query';
import { GetAllProductsForMapQuery } from './queries/get-all-products-for-map.query';

@Controller()
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get detail of a product',
    params: [
      {
        name: 'productId',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
  })
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('/products/:productId')
  async getProductDetails(
    @Param('productId') productId: string,
    @Query() query: GetProductsQuery,
  ) {
    const products = await this.productsService.getOne(productId, query);
    return products;
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all active products',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/products')
  async getAllProducts(@Query() query: GetAllProductsQuery) {
    const product = await this.productsService.getAllProducts(query);
    return product;
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all active products for map',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/map-products')
  async getAllProductsForMap(@Query() query: GetAllProductsQuery) {
    const products = await this.queryBus.execute(
      new GetAllProductsForMapQuery(query),
    );

    return products;
  }
}
