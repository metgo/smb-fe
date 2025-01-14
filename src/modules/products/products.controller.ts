/* eslint-disable no-undef */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { ProductsService } from 'src/modules/products/products.services';
import {
  GetAllProductsForLoggedInUserQuery,
  GetAllProductsForNonLoggedInUserQuery,
  GetProductsStatsQuery,
} from 'src/modules/products/queries';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get active product detail by all',
    params: [
      {
        name: 'productId',
        type: 'string',
        required: true,
      },
    ],
  })
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('/products/:productId')
  async getProductDetailsByAll(
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    const product = await this.productsService.findOne(productId);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get detail of a product by superadmin and dmo-admin',
    params: [
      {
        name: 'productId',
        type: 'string',
        required: true,
      },
    ],
    noAuthToken: true,
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('admin/products/:productId')
  async getProductDetailsByAdmin(
    @Req() req,
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    const product = await this.productsService.findOneForLoggedInUser(
      productId,
      req.user,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all my products',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/my-products')
  async getMyProductsDetails(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetAllProductsForLoggedInUserQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      myProduct: true,
      collaboratedProducts: false,
      loggedInUser: req.user,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get detail of a product of logged-in user',
    params: [
      {
        name: 'productId',
        type: 'string',
        required: true,
      },
    ],
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('/my-products/:productId')
  async getProductDetailsByALoggedInUser(
    @Req() req,
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    const product = await this.productsService.findOneForLoggedInUser(
      productId,
      req.user,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @Roles(
    UserType.AUTHORITY,
    UserType.AUTHORITY_ADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all products by superadmin and dmo-admin',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('admin/products')
  async getBusinessProducts(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetAllProductsForLoggedInUserQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      loggedInUser: req.user,
      isAdmin: true,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all my collaborated products',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/collaborated-products')
  async getMyCollaboratedProductsDetails(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetAllProductsForLoggedInUserQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      myProduct: false,
      collaboratedProducts: true,
      loggedInUser: req.user,
    });

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get all active products by users',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/products')
  async getAllProducts(
    @Res() response: Response,
    @Query() query: GetAllProductsForNonLoggedInUserQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.DMOADMIN, UserType.TRAVELLER)
  @UseGuards(JwtAuthGuard)
  @Get('stats/products')
  async getProductsStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetProductsStatsQuery,
  ) {
    const productsStats = await this.productsService.getStats(req.user, query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      productsStats,
      null,
      null,
    );
  }
}
