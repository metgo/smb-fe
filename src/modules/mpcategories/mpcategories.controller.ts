import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res,
} from '@nestjs/common';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { MPCategoiresService } from './mpcategories.service';
import { createMPCategoriesDto, FilterQuery, updateMPCategoriesDto } from './dto';
import { responseHelper } from 'src/core/helper/response.helper';
import { Response } from 'express';

@Controller()
export class MPCategoriesController {
  constructor(private readonly mpCategoriesService: MPCategoiresService) { }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_CREATED },
  })
  @Post('admin/mp-categories')
  async createMPCategories(@Res() response: Response, @Body() dto: createMPCategoriesDto) {
    await this.mpCategoriesService.findByFieldName('name', dto.name);
    const mpCategories = await this.mpCategoriesService.createMPCategories(dto);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.MAP_POINT_CATEGORIES_CREATED,
      mpCategories,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Categories'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_LISTED },
     softBlockExtraDtoFields: true,
   })
  @Get('admin/mp-categories')
  async getAllMPCategories(@Res() response: Response, @Query() query: FilterQuery) {
    const mpCategories = await this.mpCategoriesService.getAllMPCategories(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_CATEGORIES_CREATED,
      mpCategories,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_UPDATED },
  })
   @Put('admin/mp-categories/:id')
   async updateMPCategories(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateMPCategoriesDto,
   ) {
     await this.mpCategoriesService.findByFieldNameExcludeId('name', dto.name, id);
     const mpCategories = await this.mpCategoriesService.updateMPCategories(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_CATEGORIES_UPDATED,
       mpCategories,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_CATEGORIES_UPDATED },
  })
  @Delete('admin/mp-categories/:id')
  async deleteMPCategories(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const mpCategories = await this.mpCategoriesService.softDeleteMPCategories(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_CATEGORIES_UPDATED,
      mpCategories,
      null,
      null,
    );
  }
}
