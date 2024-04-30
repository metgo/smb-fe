import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { GetALLBusinessProductStatsquery } from 'src/modules/stats/query/query.dto';
import { StatsService } from 'src/modules/stats/stats.service';
import { GetByDateRangeQuery } from 'src/modules/stats/query/get-date-range.query';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @ApiEndpoint({
    tags: ['Business, Stats'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/stats/business')
  async getBusinessStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetALLBusinessProductStatsquery,
  ) {
    const businessStats = await this.statsService.getBusinessStats(
      req.user,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSINESS_LISTED,
      businessStats,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products, Stats'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PRODUCTS.LISTED,
    },
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/stats/Product')
  async getProductStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetALLBusinessProductStatsquery,
  ) {
    const productStats = await this.statsService.getProductStats(
      req.user,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PRODUCTS.LISTED,
      productStats,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Campaign, Stats'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @Get('/stats/campaigns')
  async getCampaignStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetByDateRangeQuery,
  ) {
    const campaignStats = await this.statsService.getCampaignStats(
      req.user,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CAMPAIGN_LISTED,
      campaignStats,
      null,
      null,
    );
  }
}
