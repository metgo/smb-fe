import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res,
} from '@nestjs/common';
import { MPSubCategoriesService } from './mpsubcategories.service';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Response } from 'express';
import { createMPSubCategoriesDto, FilterQuery, updateMPSubCategoriesDto } from './dto';

@Controller()
export class MPSubCategoriesController {
  constructor(private readonly mpSubCategoriesService: MPSubCategoriesService) { }

     @ApiEndpoint({
       tags: ['Admin', 'Map Point Sub Categories'],
       response: { status: 201, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_CREATED },
     })
  @Post('admin/mp-sub-categories')
  async createMPSubCategories(@Res() response: Response, @Body() dto: createMPSubCategoriesDto) {
    const MPSubCategories = await this.mpSubCategoriesService.createMPSubCategories(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_CREATED,
      MPSubCategories,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Sub Categories'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED },
     softBlockExtraDtoFields: true,
   })
  @Get('admin/mp-sub-categories')
     async getAllMPSubCategories(@Res() response: Response, @Query() query: FilterQuery) {
       const MPSubCategories = await this.mpSubCategoriesService.getAllMPSubCategories(query);

       return responseHelper(
         response,
         HttpStatus.OK,
         ServerSuccess.MAP_POINT_SUB_CATEGORIES_LISTED,
         MPSubCategories,
         null,
         null,
       );
     }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED },
  })
  @Put('admin/mp-sub-categories/:id')
   async updateMPSubCategories(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateMPSubCategoriesDto,
   ) {
     const MPSubCategories = await this.mpSubCategoriesService.updateMPSubCategories(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
       MPSubCategories,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED },
  })
  @Delete('admin/mp-sub-categories/:id')
  async deleteMPSubCategories(
    @Res() response: Response,
    @Param() id: string,
  ) {
    const MPSubCategories = await this.mpSubCategoriesService.softDeleteMPSubCategories(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
      MPSubCategories,
      null,
      null,
    );
  }
}
