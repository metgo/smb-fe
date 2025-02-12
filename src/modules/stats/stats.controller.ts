import {
  Controller,
  // Get,
  // HttpCode,
  // HttpStatus,
  // Query,
  // Req,
  // Res,
  // UseGuards,
} from '@nestjs/common';
// import { Response } from 'express';
// import { ServerSuccess } from 'src/common/constant';
// import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
// import { Roles } from 'src/core/guards/authorization/roles';
// import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
// import { responseHelper } from 'src/core/helper/response.helper';
// import { GetByDateRangeQuery } from 'src/modules/stats/query/get-date-range.query';
// import { UserType } from 'src/modules/users/users.type';
// import { GetAllBusinessStatsquery } from 'src/modules/stats/query/get-business-stats.query';
// import { GetAllProductStatsQuery } from 'src/modules/stats/query/get-product-stats.query';
import { StatsService } from 'src/modules/stats/stats.service';

@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  // @ApiEndpoint({
  //   tags: ['Business, Stats'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.BUSINESS_LISTED,
  //   },
  //   noAuthToken: true,
  // })
  // @UseGuards(JwtAuthGuard)
  // @Get('/stats/business')
  // async getBusinessStats(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Query() query: GetAllBusinessStatsquery,
  // ) {
  //   const businessStats = await this.statsService.getBusinessStats(
  //     req.user,
  //     query,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.BUSINESS_LISTED,
  //     businessStats,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Products, Stats'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.PRODUCTS.LISTED,
  //   },
  //   noAuthToken: true,
  // })
  // @UseGuards(JwtAuthGuard)
  // @Get('/stats/Product')
  // async getProductStats(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Query() query: GetAllProductStatsQuery,
  // ) {
  //   const productStats = await this.statsService.getProductStats(
  //     req.user,
  //     query,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.PRODUCTS.LISTED,
  //     productStats,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Campaign, Stats'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.CAMPAIGN_LISTED,
  //   },
  //   noAuthToken: true,
  // })
  // @Roles(UserType.SUPERADMIN, UserType.DMOADMIN)
  // @UseGuards(JwtAuthGuard)
  // @Get('/stats/campaigns')
  // async getCampaignStats(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Query() query: GetByDateRangeQuery,
  // ) {
  //   const campaignStats = await this.statsService.getCampaignStats(
  //     req.user,
  //     query,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.CAMPAIGN_LISTED,
  //     campaignStats,
  //     null,
  //     null,
  //   );
  // }

  // @HttpCode(HttpStatus.OK)
  // @ApiEndpoint({
  //   tags: ['Stats'],
  //   response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Get list of reports',
  // })
  // @Roles(
  //   UserType.ADMIN,
  //   UserType.AUTHORITY,
  //   UserType.DMOADMIN,
  //   UserType.DMO,
  //   UserType.SUPERADMIN,
  // )
  // @UseGuards(JwtAuthGuard)
  // @Get('stats/purchase-reports')
  // async getPurchaseReport(
  //   @Query() query: GetByDateRangeQuery,
  //   @Res() response: Response,
  // ) {
  //   const reports = await this.statsService.getPurchaseReports(query);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.LISTED,
  //     reports,
  //     null,
  //     null,
  //   );
  // }

  // @HttpCode(HttpStatus.OK)
  // @ApiEndpoint({
  //   tags: ['Stats'],
  //   response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  //   operation: 'Get list of most populars',
  // })
  // @Roles(
  //   UserType.ADMIN,
  //   UserType.AUTHORITY,
  //   UserType.DMOADMIN,
  //   UserType.DMO,
  //   UserType.SUPERADMIN,
  // )
  // @UseGuards(JwtAuthGuard)
  // @Get('stats/popular')
  // async getAllPopulars(@Res() response: Response) {
  //   const users = await this.statsService.getAllPopulars();
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.LISTED,
  //     users,
  //     null,
  //     null,
  //   );
  // }
}
