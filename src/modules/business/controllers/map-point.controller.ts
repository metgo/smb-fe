import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import {
  CreateMapPointsDto,
  UpdateMapPointsByAdminDto,
  UpdateMapPointsDto,
} from 'src/modules/business/dto';
import { MapPointsService } from 'src/modules/business/services/map-point.service';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class MapPointsController {
  constructor(private readonly mapPointsService: MapPointsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Point of Interest'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.MAPPOINTS.CREATED,
    },
    noAuthToken: true,
    operation: 'Create a point of interest by any logged in user',
  })
  @Post('point-of-interests')
  async createMapPoint(
    @Req() request,
    @Res() response: Response,
    @Body() dto: CreateMapPointsDto,
  ) {
    const mapPoints = await this.mapPointsService.createMapPoints(
      dto,
      request.user.id,
    );

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.MAPPOINTS.CREATED,
      mapPoints,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Point of Interests'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'mapPointId', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Patch('point-of-interests/:mapPointId')
  async updateMapPoint(
    @Req() request,
    @Res() response: Response,
    @Param('mapPointId') mapPointId: string,
    @Body() body: UpdateMapPointsDto,
  ) {
    const mapPoints = await this.mapPointsService.updateMapPoint(
      mapPointId,
      request.user,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAPPOINTS.UPDATED,
      mapPoints,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Point of Interests'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'mappointId', type: 'string', required: true }],
  })
  @Roles(UserType.DMO, UserType.DMOADMIN, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('admin/point-of-interests/:mappointId')
  async updateMappointByAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('mappointId') mappointId: string,
    @Body() body: UpdateMapPointsByAdminDto,
  ) {
    const mappoint = await this.mapPointsService.updateMapPoint(
      mappointId,
      request.user,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAPPOINTS.UPDATED,
      mappoint,
      null,
      null,
    );
  }
}
