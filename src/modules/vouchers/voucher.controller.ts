/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
import {
  Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { ServerSuccess } from 'src/common/constant';
import { ExternalApiFilterQuery } from 'src/common/query-handler/external-api-filter.query';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { VoucherService } from './voucher.service';
import {
  FilterQuery, createVoucherDto, updateAssignedUserVoucherDto,
} from './dto';
import { CampaignService } from '../campaign/campaign.service';
import { Campaign } from '../campaign/schema/campaign.schema';
import { UsersService } from '../users/users.services';
import { User } from '../users/schema/users.schema';
import { VoucherStatus } from 'src/common/enum';
import { UpdateFieldInterface } from './interface';
import { responseHelper } from 'src/core/helper/response.helper';
import { Response } from 'express';
import { ConfigService } from 'src/services/config/config.service';
import { UpdateVoucherBalance } from 'src/modules/vouchers/dto/update-voucher-balance.dto';

@Controller()
export class VoucherController {
  constructor(
    private readonly voucherService: VoucherService,
    private readonly campaignService: CampaignService,
    private readonly userSerive: UsersService,
    private readonly configService: ConfigService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Voucher'],
    response: { status: 201, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Post('buy-voucher')
  async create(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
  ) {
    const userId: string | null = req.user ? req.user.id : null;
    let campaign: Campaign;

    if (dto.campCode) {
      campaign = await this.campaignService.findAndReturn('code', dto.campCode);
    }
    const link = await this.voucherService.create(dto, userId, campaign._id);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      link,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.LISTED },
  })
  @Get('voucher-code/:code')
  async getOne(@Res() response: Response, @Param('code') code: string) {
    const voucher = await this.voucherService.getOne(code);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucher,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.CREATED },
    softBlockExtraDtoFields: true,
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
    tags: ['Admin', 'Voucher'],
    response: {
      status: 200,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('my-voucher')
  async getAll(
    @Res() response: Response,
    @Req() request,
    @Query() query: FilterQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getMy(userId, query);
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
    tags: ['Admin', 'Voucher'],
    response: {
      status: 200,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('voucher/assign-me')
  async assignToMe(
    @Res() response: Response,
    @Req() request,
    @Query() query: FilterQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getMy(userId, query, true);
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
    tags: ['Admin', 'Voucher'],
    response: { status: 200, description: ServerSuccess.VOUCHER.ASSIGNED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Put('voucher/assign-user')
  async assignUser(
    @Req() req,
    @Res() response: Response,
    @Body() dto: updateAssignedUserVoucherDto,
  ) {
    const userId = req.user.id;
    let user: User | null;
    if (dto.email) {
      user = await this.userSerive.findByEmailOrNull(dto.email);
    }
    const updateField: UpdateFieldInterface = {
      assignedTo: user ? user._id : null,
      waitingUserEmail: user ? null : dto.email,
      status: user ? VoucherStatus.ASSIGNED : VoucherStatus.WAITING,
      updatedBy: userId,
      updatedAt: new Date(),
    };
    await this.voucherService.assignUser(dto.code, updateField, user);
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
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('externalapi/my_vouchers')
  async getAllMyVouchersExternalApi(
    @Res() response: Response,
    @Req() request,
    @Query() query: ExternalApiFilterQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getMyVoucherForExternalApi(userId, query);
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
  })
  @UseGuards(ExternalApiGuard)
  @Put('externalapi/assign_voucher_to_user')
  async assignVoucherToUserExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: updateAssignedUserVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const userId = req.user.id;
    let user: User | null;
    if (dto.email) {
      user = await this.userSerive.findByEmailOrNull(dto.email);
    }
    const updateField: UpdateFieldInterface = {
      assignedTo: user ? user._id : null,
      waitingUserEmail: user ? null : dto.email,
      status: user ? VoucherStatus.ASSIGNED : VoucherStatus.WAITING,
      updatedBy: userId,
      updatedAt: new Date(),
    };
    console.log(query);
    await this.voucherService.assignUser(dto.code, updateField);
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
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('externalapi/purchase_vouchers')
  async buyVoucherByExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
    @Query() query: ExternalApiPostQuery,
  ) {
    const link = await this.voucherService.purchaseVoucherForExternalApi(dto, query, req.user.id);

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
    tags: ['External Api', 'Voucher'],
    response: { status: HttpStatus.OK, description: ServerSuccess.VOUCHER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
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
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Get('externalapi/voucher/:code')
  async getVoucherDetailByExternalApi(
    @Res() response: Response,
    @Param('code') code: string,
    // eslint-disable-next-line no-unused-vars
    @Query() query: ExternalApiPostQuery,
  ) {
    const voucher = await this.voucherService.getOne(code, true);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucher,
      null,
      null,
    );
  }
}
