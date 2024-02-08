import {
  Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { CityService } from 'src/modules/city/city.service';
import { CityDTO } from 'src/modules/city/dto/create-city.dto';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class CityController {
  constructor(
      private readonly cityService: CityService,
  ) {}

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'City'],
    noAuthToken: true,
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.CITY.CREATED,
    },
  })
  @Post('admin/cities')
  async create(
    @Body() dto: CityDTO,
    @Req() req,
    @Res() response: Response,
  ) {
    const city = await this.cityService.create(dto, req.user.id);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.CITY.CREATED,
      city,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'City'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CITY.LISTED,
    },
  })
  @Get('admin/cities/:cityId')
  async getCity(
    @Param('cityId') cityId: string,
    @Res() response: Response,
  ) {
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
  @Get('admin/cities')
  async getAllCity(
    @Query() query: PaginationFilterQuery,
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
