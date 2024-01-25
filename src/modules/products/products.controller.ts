/* eslint-disable no-undef */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { Response } from 'express';
import mongoose from 'mongoose';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { BusinessService } from 'src/modules/business/business.service';
import { ProductDto } from 'src/modules/products/dto/product.dto';
import { AllFilterQuery, FilterQuery, WebCreateProduct } from 'src/modules/products/dto';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller()
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private businessService: BusinessService,
  ) {}

  @ApiEndpoint({
    tags: ['Business', 'Products'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.PRODUCTS.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create product by business',
    params: [{ name: 'businessId', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/businesses/:businessId/products')
  async createProduct(
    @Param('businessId') businessId: string,
    @Req() req,
    @Res() response: Response,
    @Body() body: ProductDto,
  ) {
    /**
     * status: BusinessStatus.APPROVED
     * need to discuess or we will not impment it
     *  */

    const business = await this.businessService.findByFieldItems({ _id: businessId });
    if (!business) {
      throw new ForbiddenException(ServerErrors.PRODUCT.ADD_FAILED.BUSINESS);
    }
    if (!(new mongoose.Types.ObjectId(req.user.id).equals(business.userId)
      || business.collabrationUser.includes(req.user.id))
    ) {
      throw new ForbiddenException(ServerErrors.FORBIDDEN);
    }

    const product = await this.productsService.create(req.user.id, businessId, business, body);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.PRODUCTS.CREATED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business', 'Products', 'Web'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.PRODUCTS.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create product for business by superadmin',
    params: [{ name: 'businessId', type: 'string', required: true }],
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('admin/businesses/:businessId/products')
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  async createProductForWeb(
    @Param('businessId') bussinessId: string,
    @Req() req,
    @Res() response: Response,
    @Body() body: WebCreateProduct,
    @UploadedFiles() file: Array<Express.Multer.File>,
  ) {
    const business = await this.businessService.findByFieldItems({ _id: bussinessId });
    if (!business) {
      throw new ForbiddenException(ServerErrors.PRODUCT.ADD_FAILED.BUSINESS);
    }
    // const userId = new mongoose.Types.ObjectId(body.userId);
    // if (!userId.equals(business.userId)
    //   || business.collabrationUser.includes(userId)
    // ) {
    //   throw new ForbiddenException(ServerErrors.FORBIDDEN);
    // }

    const product = await this.productsService.createForWeb(req.user.id, bussinessId, business, body, file);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.PRODUCTS.CREATED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products'],
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'Get active product detail by all',
    params: [{
      name: 'productId',
      type: 'string',
      required: true,
    }],
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
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'Get detail of a product by admin, superadmin and dmo user',
    params: [{
      name: 'productId',
      type: 'string',
      required: true,
    }],
    noAuthToken: true,
  })
  @Roles(UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get('admin/products/:productId')
  async getProductDetailsByAdmin(
    @Req() req,
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    const product = await this.productsService.findOneForLoggedInUser(productId, req.user);
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
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
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
    @Query() query: AllFilterQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      myProduct: true,
      collaboratedProducts: false,
      loggedInUser: req.user.id,
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
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'Get detail of a product of logged-in user',
    params: [{
      name: 'productId',
      type: 'string',
      required: true,
    }],
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
    const product = await this.productsService.findOneForLoggedInUser(productId, req.user);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      product,
      null,
      null,
    );
  }

  @Roles(UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Products'],
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'Get all products by admin, dmo and superadmin',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('admin/products')
  async getBusinessProducts(
    @Req() req,
    @Res() response: Response,
    @Query() query: AllFilterQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      myProduct: false,
      collaboratedProducts: false,
      loggedInUser: req.user.id,
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
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
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
    @Query() query: AllFilterQuery,
  ) {
    const product = await this.productsService.findAll({
      query,
      myProduct: false,
      collaboratedProducts: true,
      loggedInUser: req.user.id,
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
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.LISTED },
    operation: 'Get all active products by users',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/products')
  async getAllProducts(
    @Res() response: Response,
    @Query() query: FilterQuery,
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
    tags: ['Business', 'Products'],
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update product details',
    params: [{
      name: 'businessId',
      required: true,
      type: 'string',
    },
    {
      name: 'productId',
      type: 'string',
      required: true,
    }],
  })
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/businesses/:businessId/products/:productId')
  async updateProduct(
    @Param('businessId') businessId: string,
    @Param('productId') productId: string,
    @Body() body: ProductDto,
    @Req() req,
    @Res() response: Response,
  ) {
    const product = await this.productsService.update({
      productId,
      businessId,
      loggedInUserId: req.user.id,
      body,
      isAdmin: false,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.UPDATED,
      product,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Product', 'Web'],
    response: { status: 200, description: ServerSuccess.PRODUCTS.UPDATED },
    noAuthToken: true,
    params: [
      { name: 'businessId', type: 'string', required: true },
      { name: 'productId', type: 'string', required: true },
    ],
    operation: 'Update the product by super admin roles',
  })
  @Put('admin/businesses/:businessId/products/:productId')
  async updateProductByAdmin(
    @Param('businessId') businessId: string,
    @Param('productId') productId: string,
    @Body() body: WebCreateProduct,
    @Req() req,
    @Res() response: Response,
  ) {
    const product = await this.productsService.update({
      productId,
      businessId,
      loggedInUserId: req.user.id,
      body,
      isAdmin: true,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.UPDATED,
      product,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Business', 'Products'],
    response: { status: HttpStatus.OK, description: ServerSuccess.PRODUCTS.UPDATED },
    noAuthToken: true,
    operation: 'Delete a product',
    params: [{
      name: 'businessId',
      type: 'string',
      required: true,
    },
    {
      name: 'productId',
      type: 'string',
      required: true,
    }],
  })
  @ApiNotFoundResponse({ description: ServerErrors.PRODUCT.NOT_FOUND })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('/businesses/:businessId/products/:productId')
  async deleteProduct(
    @Param('businessId') businessId: string,
    @Param('productId') productId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const deletedProduct = await this.productsService.softDelete(businessId, productId, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.DELETED,
      deletedProduct,
      null,
      null,
    );
  }
}
