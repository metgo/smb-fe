/* eslint-disable no-undef */
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Res,
  Req,
  Put,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { calculateProductsTotalAmount } from 'src/common/calculate-products-total-amount';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { AuthService } from 'src/modules/auth/auth.services';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import {
  AssignVoucherDto,
  CreateCampaignDto,
  CreateOrderDto,
  CreateVoucherDto,
  ExternalApiRegisterRequest,
  RewardVouchersByCampaignDto,
} from 'src/modules/external-api/dto';
import {
  ExternalApiPostQuery,
  GetAllCategoriesQuery,
  GetAllProductsQuery,
  GetMyVouchersQuery,
  GetVoucherByCodeQuery,
} from 'src/modules/external-api/queries';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { UserType } from 'src/modules/users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller('externalapi')
export class ExternalAPIServiceController {
  constructor(
    private authService: AuthService,
    private externalApiService: ExternalApiServices,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @Post('login')
  async login(@Body() body: SignInRequest) {
    return await this.authService.login(body);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @Post('register')
  async register(@Body() body: ExternalApiRegisterRequest) {
    await this.externalApiService.registerUser(body);
    return await this.authService.login(body);
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @UseGuards(ExternalApiGuard)
  @Get('get_categories')
  async getAllCategoriesForExternalApi(
    @Res() response: Response,
    @Query() query: GetAllCategoriesQuery,
  ) {
    const allBussCategoires = await this.externalApiService.getAllCategories(
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.LISTED,
      allBussCategoires,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.ORDERS.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('orders')
  async createOrderForExternalApi(
    @Body() body: CreateOrderDto,
    @Query() query: ExternalApiPostQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    try {
      const productIds = body.products.map(product => product.id);
      const productsFromDB = await this.externalApiService.findProductsIds(
        productIds,
      );

      let totalAmountToPay: number = await calculateProductsTotalAmount(
        body.products,
        productsFromDB,
      );
      const actualAmountOfProduct = totalAmountToPay;

      let redeemedVouchers;
      if (body?.voucher?.length) {
        const voucherIds = body.voucher.map(voucher => voucher.id);
        const vouchers = await this.externalApiService.findVouchersByValidIds(
          voucherIds,
        );

        if (vouchers?.length) {
          const sortedVoucher = sortByPriorityAndHighest(
            totalAmountToPay,
            vouchers,
          );

          if (sortedVoucher?.length) {
            redeemedVouchers = await this.externalApiService.processVouchers(
              req.user.id,
              sortedVoucher,
              totalAmountToPay,
            );

            if (redeemedVouchers?.length) {
              const redeemedAmount = redeemedVouchers.reduce(
                (total: number, item) => total + item.redeemedAmount,
                0,
              );
              totalAmountToPay -= redeemedAmount;
            }
          }
        }
      }

      const order = await this.externalApiService.createOrder({
        loggedInUserId: req.user.id,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        actualAmountOfProduct,
        identifierId: query.identifierId,
      });

      return responseHelper(
        response,
        HttpStatus.CREATED,
        ServerSuccess.ORDERS.CREATED,
        order,
        null,
        null,
      );
    } catch (err) {
      exceptionHandling(err);
    }
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'External Api - Get all products',
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ExternalApiGuard)
  @Get('get_all_products')
  async getAllProductsForExternalApi(
    @Res() response: Response,
    @Query() query: GetAllProductsQuery,
  ) {
    const product = await this.externalApiService.getAllProducts(query);

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
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @UseGuards(ExternalApiGuard)
  @Get('get_all_businesses')
  async getAllBusinessForExternalApi(
    @Res() response: Response,
    @Query() query?: GetAllProductsQuery,
  ) {
    const business = await this.externalApiService.getAllBusiness(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      business,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get created voucher list of logged in user - EXTERNAL API',
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('my_vouchers')
  async getAllMyVouchersExternalApi(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyVouchersQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.externalApiService.getVouchersCreatedByMe(
      userId,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      vouchers,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External Api'],
    response: { status: 200, description: ServerSuccess.VOUCHER.ASSIGNED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Assign voucher to other user by email - EXTERNAL API',
  })
  @UseGuards(ExternalApiGuard)
  @Put('assign_voucher_to_user')
  async assignVoucherToUserExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: AssignVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    await this.externalApiService.assignVoucher({
      loggedInUser: req.user,
      body: dto,
      query: query.identifierId,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      `${ServerSuccess.EXTERNAL_API.VOUCHER.ASSIGNED}:${dto.email}`,
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Purchase voucher by anyone - EXTERNAL API',
  })
  @UseGuards(ExternalApiGuard)
  @Post('purchase_vouchers')
  async buyVoucherByExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: CreateVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const link = await this.externalApiService.purchaseVoucher(
      dto,
      query,
      req.user,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      `${dto.campCode} ${ServerSuccess.EXTERNAL_API.VOUCHER.CREATED}`,
      link,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Purchase voucher by superadmin - EXTERNAL API',
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('admin/vouchers')
  async buyVoucherByExternalApiBySuperAdmin(
    @Req() req,
    @Res() response: Response,
    @Body() dto: CreateVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const link = await this.externalApiService.createVoucherBySuperadmin(
      req.user,
      dto,
      query.identifierId,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      `${dto.campCode} ${ServerSuccess.EXTERNAL_API.VOUCHER.CREATED}`,
      link,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    noAuthToken: true,
    operation:
      'Get voucher detail by anyone using valid code if it is eligible for product buying - EXTERNAL API',
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('voucher/:code')
  async getVoucherDetailByExternalApi(
    @Res() response: Response,
    @Param('code') code: string,
    @Query() query: GetVoucherByCodeQuery,
  ) {
    const voucher = await this.externalApiService.getVoucherByCodeAndProduct({
      code,
      productId: query.productId,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucher,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    operation: 'Get voucher detail by anyone using valid code - EXTERNAL API',
  })
  @HttpCode(HttpStatus.OK)
  @Get('vouchers/balance/:code')
  async getOneByCodeByExternalApi(
    @Param('code') code: string,
    @Res() response: Response,
  ) {
    const voucher = await this.externalApiService.getVoucherByCode(code);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucher,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.CAMPAIGN_CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  @Post('admin/campaigns')
  async create(
    @Body() dto: CreateCampaignDto,
    @Query() query: ExternalApiPostQuery,
    @Req() request,
    @Res() response: Response,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const campaign = await this.externalApiService.createCampaigns(
      dto,
      image,
      request.user.id,
      query.identifierId,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.CAMPAIGN_CREATED,
      campaign,
      null,
      null,
    );
  }

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @ApiEndpoint({
    tags: ['External Api'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Reward Vouchers to users',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('admin/campaign-vouchers')
  async rewardVouchersForCampaogn(
    @Req() req,
    @Res() response: Response,
    @Body() body: RewardVouchersByCampaignDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const vouchers = await this.externalApiService.createVouchersByCampaign(
      req.user,
      body,
      query.identifierId,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.VOUCHER.LISTED,
      vouchers,
      null,
      null,
    );
  }
}
