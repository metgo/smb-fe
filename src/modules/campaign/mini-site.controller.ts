import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetProductsByCampaignRequest } from './requests/get-products-by-campaign.request';
import { GetProductsByCampaignQuery } from './queries/get-products-by-campaign.query';

@Controller('mini-site')
export class MiniSiteController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Mini Site'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    operation: 'Get products list for mini site by campaign',
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
    status: HttpStatus.GONE,
    description: ServerErrors.VOUCHER.EXPIRED,
  })
  @HttpCode(HttpStatus.OK)
  @Get('products/:campCode')
  async getProductsByVoucher(
    @Param('campCode') campCode: string,
    @Query() query: GetProductsByCampaignRequest,
  ) {
    const voucher = await this.queryBus.execute(
      new GetProductsByCampaignQuery(campCode, query),
    );

    return voucher;
  }
}
