import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { GetUsersBusinessesQuery } from 'src/modules/business/queries';
import { MapPointsService } from 'src/modules/business/services/map-point.service';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class MapPointsController {
  constructor(private readonly mapPointsService: MapPointsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Map-Points'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.MAPPOINTS.CREATED,
    },
    noAuthToken: true,
    operation: 'Create an MapPoints by any logged in user',
  })
  @Post('map-points')
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

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Map-Points'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.LISTED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
    operation: 'Get all map-points',
  })
  @Get('map-points')
  async getAllMapPoints(
    @Req() req,
    @Res() response: Response,
    @Query() query?: GetUsersBusinessesQuery,
  ) {
    const mapPoints = await this.mapPointsService.getAllMapPoints(
      query,
      req.user,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAPPOINTS.LISTED,
      mapPoints,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Map-Points'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.LISTED,
    },
    noAuthToken: true,
    operation: 'Get approved map point detail by any user',
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Get('map-points/:id')
  async getMapPointsForAll(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const mapPoint = await this.mapPointsService.getMapPoints({
      id,
      loggedInUser: req.user,
    });

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAPPOINTS.LISTED,
      mapPoint,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Map-Points'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'mapPointId', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Patch('map-points/:mapPointId')
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
    tags: ['Admin', 'Map-Points'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'mappointId', type: 'string', required: true }],
  })
  @Roles(UserType.DMO, UserType.DMOADMIN, UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('admin/map-points/:mappointId')
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

  @ApiEndpoint({
    tags: ['Map-Points'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MAPPOINTS.DELETED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Delete('map-points/:id')
  async deleteMapPoint(
    @Req() request,
    @Res() response: Response,
    @Param('id') mapPointId: string,
  ) {
    const mapPoints = await this.mapPointsService.deleteMapPoint(
      mapPointId,
      request.user.id,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAPPOINTS.DELETED,
      mapPoints,
      null,
      null,
    );
  }
}
