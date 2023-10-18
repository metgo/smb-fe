import {
  Body, Controller, Get, HttpStatus, Post, Res,
} from '@nestjs/common';
import {
  createMapPointCategoriesDto, createMapPointDto, createMapPointSubCategoriesDto, createMapPointSubCategoriesItemDto,
} from './dto';
import { MapPointServices } from './mappoint.services';
import { Response } from 'express';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';

@Controller()
export class MapPointController {
  constructor(private readonly mapPointService: MapPointServices) { }

  @ApiEndpoint({
    tags: ['Admin'],
    response: { status: 200, description: 'Map Point was successfully created' },
  })
  @Post('admin/map-point')
  async createMapPoint(@Res() response: Response, @Body() dto: createMapPointDto) {
    await this.mapPointService.findByName(dto.name);
    const newMapPoint = await this.mapPointService.createMapPoint(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Map Point was successfully created',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point')
  async getAllMapPoint() {
    return await this.mapPointService.getAllMapPoint();
  }

  // mapPoint Categories actions
   @Post('admin/map-point-Categories')
  async createMapPointCategories(@Res() response: Response, @Body() dto: createMapPointCategoriesDto) {
    const newMapPoint = await this.mapPointService.createMapPointCategories(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'map Point has been created successfully',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point-Categories')
   async getAllMapPointCategories() {
     return await this.mapPointService.getAllMapPointCategories();
   }

  // mapPoint subCategories actions
   @Post('admin/map-point-sub-Categories')
  async createMapPointSubCategories(@Res() response: Response, @Body() dto: createMapPointSubCategoriesDto) {
    const newMapPoint = await this.mapPointService.createMapPointSubCategories(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'map Point has been created successfully',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point-sub-Categories')
   async getAllMapPointSubCategories() {
     return await this.mapPointService.getAllMapPointSubCategories();
   }

  // mapPoint subCategories actions
   @Post('admin/map-point-sub-Categories-items')
  async createMapPointSubCategoriesItems(@Res() response: Response, @Body() dto: createMapPointSubCategoriesItemDto) {
    const newMapPoint = await this.mapPointService.createMapPointSubCategoriesItems(dto);
    return response.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'map Point has been created successfully',
      data: newMapPoint,
    });
  }

  @Get('admin/map-point-sub-Categories-items')
   async getAllMapPointSubCategoriesItems() {
     return await this.mapPointService.getAllMapPointSubCategoriesItems();
   }
}
