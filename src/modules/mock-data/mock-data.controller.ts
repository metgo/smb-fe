import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { GetMockDataQuery } from 'src/modules/mock-data/queries/get-mock-data.query';
import { MockDataServices } from 'src/modules/mock-data/mock-data.services';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class MockDataController {
  constructor(private mockDataServices: MockDataServices) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Admin', 'Mock Data'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MOCK_DATA.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get list of all mocked data by superadmin',
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Get('mock-data')
  async getAllData(
    @Query() query: GetMockDataQuery,
    @Res() response: Response,
  ) {
    const users = await this.mockDataServices.getAllData(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MOCK_DATA.LISTED,
      users,
      null,
      null,
    );
  }
}
