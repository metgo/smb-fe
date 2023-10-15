import {
  Body, Controller, Get, HttpStatus, InternalServerErrorException, Post, Res,
} from '@nestjs/common';
import { createMapPointCategoriesDto, createMapPointDto } from './dto';
import { MapPointServices } from './mappoint.services';
import { Response } from 'express';

@Controller()
export class MapPointController {
  constructor(private readonly mapPointService: MapPointServices) { }

  @Post('admin/map-point')
  async createMapPoint(@Res() response: Response, @Body() dto: createMapPointDto) {
    await this.mapPointService.findByName(dto.name);
    const newMapPoint = await this.mapPointService.createMapPoint(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'map Point has been created successfully',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point')
  async getAllMapPoint() {
    return await this.mapPointService.getAllMapPoint();
  }

  // mapPoint categoires actions
   @Post('admin/map-point-categoires')
  async createMapPointCategoires(@Res() response: Response, @Body() dto: createMapPointCategoriesDto) {
    const newMapPoint = await this.mapPointService.createMapPointCategoires(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'map Point has been created successfully',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point-categoires')
   async getAllMapPointCategoires() {
     try {
       return await this.mapPointService.getAllMapPoint();
     } catch (error) {
       throw new InternalServerErrorException('Internal Server Error');
     }
   }
}
