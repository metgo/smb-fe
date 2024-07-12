import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import {
  createVoucherDto,
  RewardVouchersByCampaignDto,
  updateAssignedUserVoucherDto,
} from 'src/modules/vouchers/dto';
import {
  GetMyAssignedVouchersQuery,
  GetMyCreatedVouchersQuery,
  GetVoucherStatsGroupedQuery,
  GetVoucherStatsQuery,
  GetVoucherQuery,
  GetVouchersByAdminQuery,
} from 'src/modules/vouchers/queries';

@Controller()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Purchase Voucher By anyone',
  })
  @HttpCode(HttpStatus.CREATED)
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
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Purchase Voucher By Superadmin',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('admin/vouchers')
  async createPaidVouchers(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createVoucherDto,
  ) {
    const vouchers = await this.voucherService.createdBySuperadmin(
      req.user,
      dto,
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

  @Roles(UserType.ADMIN, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Voucher'],
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
  ) {
    const vouchers = await this.voucherService.createVouchersByCampaign(
      req.user,
      body,
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

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    operation:
      'Get voucher detail by anyone using valid code if it is eligible for product buying',
  })
  @HttpCode(HttpStatus.OK)
  @Get('voucher-code/:code')
  async getOne(
    @Param('code') code: string,
    @Res() response: Response,
    @Query() query: GetVoucherQuery,
  ) {
    const voucher = await this.voucherService.getOneByCodeAndProduct({
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
    operation: 'Get voucher detail by anyone using valid code',
  })
  @HttpCode(HttpStatus.OK)
  @Get('vouchers/balance/:code')
  async getOneByCode(@Param('code') code: string, @Res() response: Response) {
    const voucher = await this.voucherService.getOneByCode(code);

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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get voucher detail by logged in user using valid id',
  })
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @Get('vouchers/created-by-me')
  async getAll(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyCreatedVouchersQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getVouchersCreatedByMe(
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
  @HttpCode(HttpStatus.OK)
  @Get('vouchers/assigned')
  async assignToMe(
    @Res() response: Response,
    @Req() request,
    @Query() query: GetMyAssignedVouchersQuery,
  ) {
    const userId = request.user.id;
    const vouchers = await this.voucherService.getVouchersAssignedToMe(
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
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.ASSIGNED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Assign voucher to other user by email',
  })
  @HttpCode(HttpStatus.OK)
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

  // @ApiEndpoint({
  //   tags: ['Vouchers'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.VOUCHER.CREATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Trigger reward voucher',
  //   params: [
  //     {
  //       name: 'orderId',
  //       required: true,
  //       type: 'string',
  //     },
  //   ],
  // })
  // @Roles(
  //   UserType.ADMIN,
  //   UserType.AUTHORITY,
  //   UserType.DMOADMIN,
  //   UserType.DMO,
  //   UserType.SUPERADMIN,
  // )
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @Patch('vouchers/:orderId')
  // async triggerReward(
  //   @Param('orderId') orderId: string,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const voucher = await this.voucherService.triggerReward(req.user, orderId);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER.CREATED,
  //     voucher,
  //     null,
  //     null,
  //   );
  // }

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    noAuthToken: true,
  })
  @Roles(
    UserType.SUPERADMIN,
    UserType.DMOADMIN,
    UserType.TRAVELLER,
    UserType.DMO,
  )
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stats/vouchers-cached')
  async getVoucherStatsCached(
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

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.SUPERADMIN,
    UserType.DMO,
    UserType.DMOADMIN,
  )
  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('admin/vouchers')
  async getAllVoucherbyAdmin(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetVouchersByAdminQuery,
  ) {
    const voucher = await this.voucherService.getAllVoucherbyAdmin(
      req.user,
      query,
    );
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
    noAuthToken: true,
  })
  @Roles(
    UserType.SUPERADMIN,
    UserType.DMOADMIN,
    UserType.TRAVELLER,
    UserType.DMO,
  )
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stats/vouchers')
  async getVoucherStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetVoucherStatsGroupedQuery,
  ) {
    const voucherStats = await this.voucherService.getVoucherStats(
      req.user,
      query,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.VOUCHER.LISTED,
      voucherStats,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Voucher', 'Scheduler'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.UPDATED,
    },
    noAuthToken: true,
    operation:
      'Send emails for redeemable vouchers ASSIGNEES if created same day of month',
  })
  @Cron('0 8 * * *')
  @Post('vouchers/schedule-send-email')
  async scheduledSendEmailToRedeemableVoucherOwners() {
    return await this.voucherService.scheduledEmailToRedeemableVoucherOwners();
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EMAIL.SENT,
    },
    params: [
      {
        name: 'voucherId',
        required: true,
        type: 'string',
      },
    ],
    noAuthToken: true,
    operation: 'Send email to voucher owner',
  })
  @Post('vouchers/send-email/:voucherId')
  async sendEmailToVoucherOwner(
    @Param('voucherId') voucherId: string,
    @Res() response: Response,
  ) {
    const voucher = await this.voucherService.sendVoucherDetailEmail(voucherId);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EMAIL.SENT,
      voucher,
      null,
      null,
    );
  }
}
