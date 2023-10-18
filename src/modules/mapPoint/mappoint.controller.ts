import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res,
} from '@nestjs/common';
import {
  createMapPointCategoriesDto, createMapPointDto, createMapPointSubCategoriesDto, createMapPointSubCategoriesItemDto,
} from './dto';
import { MapPointServices } from './mappoint.services';
import { Response } from 'express';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { ServerSuccess } from 'src/common/constant';
import { updateMapPointCategoriesDto, updateMapPointDto, updateMapPointSubCategoriesDto, updateMapPointSubCategoriesItemDto } from './dto/updateMapPoint.dto';

@Controller()
export class MapPointController {
  constructor(private readonly mapPointService: MapPointServices) { }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point'],
    response: { status: 201, description: ServerSuccess.MAP_POINT_CREATED },
  })
  @Post('admin/map-point')
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
  @Get('admin/map-point')
  async getAllMapPoint(@Res() response:Response) {
    const mapPoint = await this.mapPointService.getAllMapPoint();
    return responseHelper(response, HttpStatus.OK, ServerSuccess.MAP_POINT_LISTED, mapPoint, null, null);
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_UPDATED },
   })
  @Put('admin/map-point/:id')
   async updateMapPoint(
    @Res() response: Response,
    @Param('id') mapPointId: string,
    @Body() dto: updateMapPointDto,
   ) {
     await this.mapPointService.findByName(dto.name);
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
  })
  @Delete('admin/map-point/:id')
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

   // mapPoint Categories actions
   @ApiEndpoint({
     tags: ['Admin', 'Map Point Categories'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_CREATED },
   })
   @Post('admin/map-point-Categories')
  async createMapPointCategories(@Res() response: Response, @Body() dto: createMapPointCategoriesDto) {
    const mapPointCategories = await this.mapPointService.createMapPointCategories(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_CATEGORIES_CREATED,
      mapPointCategories,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Categories'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_LISTED },
   })
  @Get('admin/map-point-Categories')
   async getAllMapPointCategories(@Res() response: Response) {
     const mapPointCategories = await this.mapPointService.getAllMapPointCategories();

     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_CATEGORIES_CREATED,
       mapPointCategories,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_UPDATED },
  })
   @Put('admin/map-point-Categories/:id')
   async updateMapPointCategories(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateMapPointCategoriesDto,
   ) {
     const mapPointCategories = await this.mapPointService.updateMapPointCategories(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_CATEGORIES_UPDATED,
       mapPointCategories,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_UPDATED },
  })
  @Delete('admin/map-point-Categories/:id')
  async deleteMapPointCategories(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const mapPointCategories = await this.mapPointService.softDeleteMapPointCategories(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_CATEGORIES_UPDATED,
      mapPointCategories,
      null,
      null,
    );
  }

  // mapPoint subCategories actions
  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories'],
    response: { status: 201, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_CREATED },
  })
  @Post('admin/map-point-sub-Categories')
  async createMapPointSubCategories(@Res() response: Response, @Body() dto: createMapPointSubCategoriesDto) {
    const mapPointSubCategories = await this.mapPointService.createMapPointSubCategories(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_CREATED,
      mapPointSubCategories,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Sub Categories'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED },
   })
  @Get('admin/map-point-sub-Categories')
  async getAllMapPointSubCategories(@Res() response: Response) {
    const mapPointSubCategories = await this.mapPointService.getAllMapPointSubCategories();

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED,
      mapPointSubCategories,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED },
  })
  @Put('admin/map-point-sub-Categories/:id')
   async updateMapPointSubCategories(
    @Res() response: Response,
    @Param() id: string,
    @Body() dto: updateMapPointSubCategoriesDto,
   ) {
     const mapPointSubCategories = await this.mapPointService.updateMapPointSubCategories(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
       mapPointSubCategories,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED },
  })
  @Delete('admin/map-point-sub-Categories/:id')
  async deleteMapPointSubCategories(
    @Res() response: Response,
    @Param() id: string,
  ) {
    const mapPointSubCategories = await this.mapPointService.softDeleteMapPointSubCategories(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
      mapPointSubCategories,
      null,
      null,
    );
  }

  // mapPoint subCategories items actions
  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories Item'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED },
  })
  @Post('admin/map-point-sub-Categories-items')
  async createMapPointSubCategoriesItems(@Res() response: Response, @Body() dto: createMapPointSubCategoriesItemDto) {
    const mapPointSubCategoriesItem = await this.mapPointService.createMapPointSubCategoriesItems(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED,
      mapPointSubCategoriesItem,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Sub Categories Item'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED },
   })
  @Get('admin/map-point-sub-Categories-items')
  async getAllMapPointSubCategoriesItems(@Res() response: Response) {
    const mapPointSubCategoriesItem = await this.mapPointService.getAllMapPointSubCategoriesItems();
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED,
      mapPointSubCategoriesItem,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories Item'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED },
  })
  @Put('admin/map-point-sub-Categories-items/:id')
   async updateMapPointSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateMapPointSubCategoriesItemDto,
   ) {
     const mapPointSubCategoriesItem = await this.mapPointService.updateMapPointSubCategoriesItems(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
       mapPointSubCategoriesItem,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories Item'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED },
  })
  @Delete('admin/map-point-sub-Categories-items/:id')
  async deleteMapPointSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const mapPointSubCategoriesItem = await this.mapPointService.softDeleteMapPointSubCategoriesItems(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
      mapPointSubCategoriesItem,
      null,
      null,
    );
  }
}
