import {
  Controller,
  // Get,
  // HttpCode,
  // HttpStatus,
  // Param,
  // Query,
  // Res,
} from '@nestjs/common';
// import { Response } from 'express';

// import { ServerSuccess } from 'src/common/constant';
// import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
// import { responseHelper } from 'src/core/helper/response.helper';
// import { GetMockDataQuery } from 'src/modules/mock-data/queries/get-mock-data.query';
import { MockDataServices } from 'src/modules/mock-data/mock-data.services';

@Controller()
export class MockDataController {
  constructor(private mockDataServices: MockDataServices) {}

  // @HttpCode(HttpStatus.OK)
  // @ApiEndpoint({
  //   tags: ['Mock Data'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.MOCK_DATA.LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   operation: 'Get list of all mocked data by superadmin',
  // })
  // @Get('mock-data')
  // async getAllData(
  //   @Query() query: GetMockDataQuery,
  //   @Res() response: Response,
  // ) {
  //   const users = await this.mockDataServices.getAllData(query);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.MOCK_DATA.LISTED,
  //     users,
  //     null,
  //     null,
  //   );
  // }

  // @HttpCode(HttpStatus.OK)
  // @ApiEndpoint({
  //   tags: [ 'Mock Data'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.MOCK_DATA.LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   operation: 'Get statistics of business or product',
  // })
  // @Get('mock-data/statistics/:businessOrProductId')
  // async getStatisticsById(
  //   @Param('businessOrProductId') businessOrProductId: string,
  //   @Res() response: Response,
  // ) {
  //   const stats = await this.mockDataServices.getStatisticsByBussOrProId(
  //     businessOrProductId,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.MOCK_DATA.LISTED,
  //     stats,
  //     null,
  //     null,
  //   );
  // }
}
