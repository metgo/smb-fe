import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';

import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { createVoucherDto } from './dto';
import { GetVoucherQuery } from './queries';
import { CreateVouchersCommand } from './commands/create-voucher.command';
import { GetVoucherByCodeQuery } from './dto/get-by-code.query';
import { GetByCodeQuery } from './queries/get-by-code.query';

@Controller()
export class VoucherController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly voucherService: VoucherService,
  ) {}

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

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.VOUCHER.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Purchase Voucher For Personal Use',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('vouchers')
  async create(@Req() req, @Body() dto: createVoucherDto) {
    const link = await this.commandBus.execute(
      new CreateVouchersCommand(dto, req?.user),
    );
    return link;
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
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `${ServerErrors.CAMPAIGN.NOT_FOUND} /  ${ServerErrors.PRODUCT.NOT_FOUND}`,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'This voucher cannot be used for this product',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ServerErrors.VOUCHER.NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.PAYMENT_REQUIRED,
    description: ServerErrors.VOUCHER.UNPAID,
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: ServerErrors.VOUCHER.EXPIRED,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: ServerErrors.VOUCHER.NO_BALANCE,
  })
  @HttpCode(HttpStatus.OK)
  @Get('vouchers/:code')
  async getVoucherDetailByExternalApi(
    @Param('code') code: string,
    @Query() query: GetVoucherQuery,
  ) {
    const voucher = await this.voucherService.getOneByCodeAndProduct({
      code,
      productId: query.productId,
      locale: query.locale,
    });
    return voucher;
  }

  @ApiEndpoint({
    tags: ['Voucher'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.VOUCHER.LISTED,
    },
    operation: 'Get voucher detail by anyone using valid code',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: ServerErrors.VOUCHER.NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ServerErrors.VOUCHER.RESTRICTED_CAMPAIGN,
  })
  @ApiResponse({
    status: HttpStatus.PAYMENT_REQUIRED,
    description: ServerErrors.VOUCHER.UNPAID,
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: ServerErrors.VOUCHER.EXPIRED,
  })
  @HttpCode(HttpStatus.OK)
  @Get('voucher-by-code/:code')
  async getVoucherDetailByCode(
    @Param('code') code: string,
    @Query() query: GetVoucherByCodeQuery,
  ) {
    const voucher = await this.queryBus.execute(
      new GetByCodeQuery(code, query),
    );

    return voucher;
  }

  // @UseGuards(JwtExternalApiAuthGuard)
  // @UseGuards(ExternalApiGuard)
  // @ApiEndpoint({
  //   tags: ['Voucher'],
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.VOUCHER.CREATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Reward Vouchers to users',
  // })
  // @HttpCode(HttpStatus.CREATED)
  // @Post('admin/campaign-vouchers')
  // async rewardVouchersForCampaogn(
  //   @Req() req,
  //   @Body() body: RewardVouchersByCampaignDto,
  //   @Query() query: ExternalApiPostQuery,
  // ) {
  //   try {
  //     if (req.user.externalApi.identifierId !== query.identifierId) {
  //       throw new UnauthorizedException(ServerErrors.FORBIDDEN);
  //     }

  //     const vouchers = await this.voucherService.createVouchersByCampaign(
  //       req.user,
  //       body,
  //       query.identifierId,
  //     );

  //     return vouchers;
  //   } catch (err) {
  //     exceptionHandling(err);
  //   }
  // }
}
