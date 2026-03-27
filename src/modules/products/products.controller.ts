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
import { GetAllProductsRequest } from 'src/modules/products/requests/get-all-products.query';
import {
  GetProductsQuery,
  GetAllProductsQuery,
  GetAllProductsForMapQuery,
} from 'src/modules/products/queries';
import { GetProductsDeliveryRequest } from './requests/get-products-delivery.query';
import { GetProductsDeliveryQuery } from './queries/get-products-delivery-info.query';

@Controller()
export class ProductsController {
  constructor(
    private readonly queryBus: QueryBus,
    private productsService: ProductsService,
  ) {}

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get detail of a product by slug',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
  })
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('/products/:slug')
  async getProductDetails(
    @Param('slug') slug: string,
    @Query() query: GetProductsQuery,
  ) {
    const products = await this.productsService.getOne(slug, query);
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
  async getAllProducts(@Query() query: GetAllProductsRequest) {
    const products = await this.queryBus.execute(
      new GetAllProductsQuery(query),
    );

    return products;
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
  async getAllProductsForMap(@Query() query: GetAllProductsRequest) {
    const products = await this.queryBus.execute(
      new GetAllProductsForMapQuery(query),
    );

    return products;
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all products delivery info',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/products-delivery')
  async getAllProductsDelivery(@Query() query: GetProductsDeliveryRequest) {
    const products = await this.queryBus.execute(
      new GetProductsDeliveryQuery(query),
    );

    return products;
  }
}
