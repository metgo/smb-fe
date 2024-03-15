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
import { UserType } from '../users/users.type';
import { GetALLBusinessProductStatsquery } from './query/query.dto';
import { StatsService } from './stats.service';

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
  @Roles(UserType.SUPERADMIN, UserType.DMOADMIN, UserType.TRAVELLER)
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
}
