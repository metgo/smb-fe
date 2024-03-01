import {
  Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import {
  createVoucherDto,
  updateAssignedUserVoucherDto,
  UpdateVoucherBalance,
} from 'src/modules/vouchers/dto';
import {
  GetMyAssignedVouchersQuery,
  GetMyCreatedVouchersQuery,
  GetMyVouchersExternalApiQuery,
  GetVoucherByExternalApiQuery,
  GetVoucherStatsQuery,
  GetVoucherQuery,
} from 'src/modules/vouchers/queries';

@Controller()
export class VoucherController {
  constructor(
    private readonly voucherService: VoucherService,
  ) {}

  @ApiEndpoint({
    tags: ['Voucher'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    operation: 'Purchase Voucher By anyone',
  })
  @Post('buy-voucher')
  async create(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
  ) {
    const link = await this.voucherService.create(req.user, dto);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.VOUCHER.LISTED,
      link,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Voucher'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Purchase Voucher By Superadmin',
  })
  @Post('admin/vouchers')
  async createPaidVouchers(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
  ) {
    const vouchers = await this.voucherService.createdBySuperadmin(req.user, dto);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.VOUCHER.LISTED,
      vouchers,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Voucher'],
    response: { status: HttpStatus.OK, description: ServerSuccess.VOUCHER.LISTED },
    operation: 'Get voucher detail by anyone using valid code',
  })
  @Get('voucher-code/:code')
  async getOne(
    @Param('code') code: string,
    @Res() response: Response,
    @Query() query: GetVoucherQuery,
  ) {
    const voucher = await this.voucherService.getOne({ code, productId: query.productId });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucher,
      null,
      null,
    );
  }

  // maybe need to update to superadmin to check expire vouchers too
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Voucher'],
    response: { status: HttpStatus.OK, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get voucher detail by logged in user using valid id',
  })
  @Get('voucher-id/:id')
  async getOneById(@Res() response: Response, @Param('id') id: string) {
    const voucher = await this.voucherService.getOneById(id);
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
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get created voucher list of logged in user',
  })
  @UseGuards(JwtAuthGuard)
  @Get('vouchers/created-by-me')
  async getAll(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyCreatedVouchersQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getVouchersCreatedByMe(userId, query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      vouchers,
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
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get assigned voucher list of logged in user',
  })
  @UseGuards(JwtAuthGuard)
  @Get('vouchers/assigned')
  async assignToMe(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyAssignedVouchersQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getVouchersAssignedToMe(userId, query);
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
    tags: ['Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.ASSIGNED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Assign voucher to other user by email',
  })
  @Put('voucher/assign-user')
  async assignUser(
    @Req() req,
    @Res() response: Response,
    @Body() dto: updateAssignedUserVoucherDto,
  ) {
    await this.voucherService.assignUser({
      loggedInUser: req.user,
      body: dto,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.ASSIGNED,
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api', 'Voucher'],
    response: {
      status: 200,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get created voucher list of logged in user - EXTERNAL API',
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('externalapi/my_vouchers')
  async getAllMyVouchersExternalApi(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyVouchersExternalApiQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getVoucherCreatedByMe(userId, query);
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
    tags: ['External Api', 'Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.ASSIGNED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Assign voucher to other user by email - EXTERNAL API',
  })
  @UseGuards(ExternalApiGuard)
  @Put('externalapi/assign_voucher_to_user')
  async assignVoucherToUserExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: updateAssignedUserVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    console.log(query);
    await this.voucherService.assignUser({
      loggedInUser: req.user,
      body: dto,
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
    tags: ['External Api', 'Voucher'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    operation: 'Purchase voucher by anyone - EXTERNAL API',
  })
  @UseGuards(ExternalApiGuard)
  @Post('externalapi/purchase_vouchers')
  async buyVoucherByExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const link = await this.voucherService.purchaseVoucherForExternalApi(dto, query, req.user);

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
    tags: ['Admin', 'External Api', 'Voucher'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Purchase voucher by superadmin - EXTERNAL API',
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('admin/externalapi/vouchers')
  async buyVoucherByExternalApiBySuperAdmin(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const link = await this.voucherService.createdBySuperadmin(req.user, dto, query.identifierId);

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
    tags: ['Admin', 'External Api', 'Voucher'],
    response: { status: HttpStatus.OK, description: ServerSuccess.VOUCHER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update voucher balance by superadmin - EXTERNAL API',
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('externalapi/update_voucher_balance')
  async updateVoucherBalanceByExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: UpdateVoucherBalance,
    @Query() query: ExternalApiPostQuery,
  ) {
    const voucher = await this.voucherService.updateVoucherAmountByExternalApi(req.user.id, query, dto);

    return responseHelper(
      response,
      HttpStatus.OK,
      `${ServerSuccess.EXTERNAL_API.VOUCHER.UPDATE_BALANCE} ${dto.amount}`,
      voucher,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['External Api', 'Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.LISTED },
    noAuthToken: true,
    operation: 'Get voucher detail by anyone using valid code - EXTERNAL API',
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('externalapi/voucher/:code')
  async getVoucherDetailByExternalApi(
    @Res() response: Response,
    @Param('code') code: string,
    @Query() query: GetVoucherByExternalApiQuery,
  ) {
    const voucher = await this.voucherService.getOne({ code, externalApi: true, productId: query.productId });
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
    response: { status: HttpStatus.OK, description: ServerSuccess.VOUCHER.LISTED },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.DMOADMIN, UserType.TRAVELLER)
  @UseGuards(JwtAuthGuard)
  @Get('stats/vouchers')
  async getVoucherStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetVoucherStatsQuery,
  ) {
    const voucherStats = await this.voucherService.getStats(req.user, query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucherStats,
      null,
      null,
    );
  }
}
