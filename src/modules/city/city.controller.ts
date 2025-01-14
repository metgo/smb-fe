import {
  Controller, Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { CityService } from 'src/modules/city/city.service';

@Controller()
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiEndpoint({
    tags: ['City'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CITY.LISTED,
    },
  })
  @Get('cities/:cityId')
  async getCity(@Param('cityId') cityId: string, @Res() response: Response) {
    const city = await this.cityService.getOne(cityId);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CITY.LISTED,
      city,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['City'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CITY.LISTED,
    },
  })
  @Get('cities')
  async getAllCity(
    @Query() query: CommonFilterQuery,
    @Res() response: Response,
  ) {
    const cities = await this.cityService.getAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.CITY.LISTED,
      cities,
      null,
      null,
    );
  }
}
