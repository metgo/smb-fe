import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { JwtExternalApiAuthGuard } from 'src/core/guards/jwt/jwt-externalapi.guards';
import { responseHelper } from 'src/core/helper/response.helper';

import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { GetVoucherByCodeQuery } from './queries/get-by-code.query';
import { RewardVouchersByCampaignDto } from './dto';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { FreezeVoucherDTO } from 'src/modules/vouchers/dto/freeze-voucher.dto';

@Controller()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // @ApiEndpoint({
  //   tags: ['Voucher'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.VOUCHER.LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Get created voucher list of logged in user',
  // })
  // @UseGuards(JwtExternalApiAuthGuard)
  // @UseGuards(ExternalApiGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get('my_vouchers')
  // async getAllMyVouchersExternalApi(
  //   @Res() response: Response,
  //   @Req() request,
  //   @Query() query: GetMyVouchersQuery,
  // ) {
  //   const userId = request.user.id;
  //   const vouchers = await this.voucherService.getVouchersCreatedByMe(
  //     userId,
  //     query,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER.LISTED,
  //     vouchers,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Voucher'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.VOUCHER.LISTED,
  //   },
  //   operation: 'Get voucher detail by anyone using valid code',
  // })
  // @HttpCode(HttpStatus.OK)
  // @Get('vouchers/balance/:code')
  // async getOneByCodeByExternalApi(
  //   @Param('code') code: string,
  //   @Res() response: Response,
  // ) {
  //   const voucher = await this.voucherService.getOneByCode(code);

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER.LISTED,
  //     voucher,
  //     null,
  //     null,
  //   );
  // }

  // @UseGuards(JwtExternalApiAuthGuard)
  // @UseGuards(ExternalApiGuard)
  // @ApiEndpoint({
  //   tags: ['Voucher'],
  //   response: { status: 200, description: ServerSuccess.VOUCHER.ASSIGNED },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Assign voucher to other user by email',
  // })
  // @Put('assign_voucher_to_user')
  // async assignVoucherToUserExternalApi(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Body() dto: AssignVoucherDto,
  //   @Query() query: ExternalApiPostQuery,
  // ) {
  //   await this.voucherService.assignVoucher({
  //     loggedInUser: req.user,
  //     body: dto,
  //     query: query.identifierId,
  //   });
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     `${ServerSuccess.EXTERNAL_API.VOUCHER.ASSIGNED}:${dto.email}`,
  //     null,
  //     null,
  //     null,
  //   );
  // }

  @ApiEndpoint({
    tags: ['Voucher Process'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Start to Purchase voucher - step [1]',
  })
  @Post('vouchers')
  async buyVoucherByExternalApi(
    @Req() req,
    @Res() response: Response,
    @Body() dto: CreateVoucherDto,
  ) {
    const vouchers = await this.voucherService.create(dto, req?.user);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      `${dto.campCode} ${ServerSuccess.EXTERNAL_API.VOUCHER.CREATED}`,
      vouchers,
      null,
      null,
    );
  }

  // @ApiEndpoint({
  //   tags: ['Voucher'],
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.VOUCHER.CREATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Purchase voucher by superadmin - EXTERNAL API',
  // })
  // @Roles(UserType.SUPERADMIN)
  // @UseGuards(JwtExternalApiAuthGuard)
  // @UseGuards(ExternalApiGuard)
  // @Post('admin/vouchers')
  // async buyVoucherByExternalApiBySuperAdmin(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Body() dto: CreateVoucherDto,
  //   @Query() query: ExternalApiPostQuery,
  // ) {
  //   const link = await this.voucherService.createdBySuperadmin(
  //     req.user,
  //     dto,
  //     query.identifierId,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     `${dto.campCode} ${ServerSuccess.EXTERNAL_API.VOUCHER.CREATED}`,
  //     link,
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
    operation:
      'Get voucher detail by anyone using valid code if it is eligible for product buying',
  })
  @Get('vouchers/:code')
  async getVoucherDetailByExternalApi(
    @Param('code') code: string,
    @Query() query: GetVoucherByCodeQuery,
  ) {
    const voucher = await this.voucherService.getOneByCodeAndProduct({
      code,
      productId: query.productId,
    });
    return voucher;
  }

  @UseGuards(JwtExternalApiAuthGuard)
  @UseGuards(ExternalApiGuard)
  @ApiEndpoint({
    tags: ['Voucher'],
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
    try {
      if (req.user.externalApi.identifierId !== query.identifierId) {
        throw new UnauthorizedException(ServerErrors.FORBIDDEN);
      }

      const vouchers = await this.voucherService.createVouchersByCampaign(
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
    } catch (err) {
      exceptionHandling(err);
    }
  }

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.VOUCHER.UPDATE_BALANCE,
    },
    softBlockExtraDtoFields: true,
    operation: 'Freeze Voucher',
  })
  @Patch('freeze-amount')
  async freezeVoucherAmount(
    @Req() req,
    @Res() response: Response,
    @Body() dto: FreezeVoucherDTO,
  ) {
    const vouchers = await this.voucherService.freezeVouchers(dto, req?.user);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EXTERNAL_API.VOUCHER.UPDATE_BALANCE,
      vouchers,
      null,
      null,
    );
  }
}
