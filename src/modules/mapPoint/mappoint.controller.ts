import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import {
  FilterQuery,
  createMapPointDto,
  updateMapPointDto,
} from './dto';
import { MapPointServices } from './mappoint.services';

@Controller()
export class MapPointController {
  constructor(private readonly mapPointService: MapPointServices) { }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point'],
    response: { status: 201, description: ServerSuccess.MAP_POINT_CREATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseGuards(JwtAuthGuard)
  @Post('admin/mp')
  async createMapPoint(@Res() response: Response, @Body() dto: createMapPointDto) {
    await this.mapPointService.findByName(dto.name);
    const newMapPoint = await this.mapPointService.createMapPoint(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_CREATED,
      newMapPoint,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_LISTED },
  })
  @Get('admin/mp')
  async getAllMapPoint(
    @Res() response:Response,
    @Query() query?: FilterQuery,
  ) {
    const mapPoint = await this.mapPointService.getAllMapPoint(query);
    return responseHelper(response, HttpStatus.OK, ServerSuccess.MAP_POINT_LISTED, mapPoint, null, null);
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_UPDATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseGuards(JwtAuthGuard)
  @Put('admin/mp/:id')
  async updateMapPoint(
    @Res() response: Response,
    @Param('id') mapPointId: string,
    @Body() dto: updateMapPointDto,
  ) {
    await this.mapPointService.findByFieldNameExcludeId('name', dto.name, mapPointId);
    const newMapPoint = await this.mapPointService.updateMapPoint(mapPointId, dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_UPDATED,
      newMapPoint,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_UPDATED },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseGuards(JwtAuthGuard)
  @Delete('admin/mp/:id')
  async deleteMapPoint(
    @Res() response: Response,
    @Param('id') mapPointId: string,
  ) {
    const newMapPoint = await this.mapPointService.softDeleteMapPoint(mapPointId);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_UPDATED,
      newMapPoint,
      null,
      null,
    );
  }
}
