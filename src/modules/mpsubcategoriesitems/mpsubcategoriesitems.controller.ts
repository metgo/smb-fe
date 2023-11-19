import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res,
} from '@nestjs/common';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { MPSubCategoriesItemsService } from './mpsubcategoriesitems.service';
import { createMPSubCategoriesItemsDto, FilterQuery, updateMPSubCategoriesItemsDto } from './dto';
import { Response } from 'express';

@Controller()
export class MPSubCategoriesItemsController {
  constructor(private readonly mpSubCategoriesItemsService: MPSubCategoriesItemsService) { }

      @ApiEndpoint({
        tags: ['Admin', 'Map Point Sub Categories Item'],
        response: { status: 201, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED },
      })
  @Post('admin/mp-sub-categories-items')
  async createMPSubCategoriesItems(@Res() response: Response, @Body() dto: createMPSubCategoriesItemsDto) {
    await this.mpSubCategoriesItemsService.findByFieldName('name', dto.name);
    const MPSubCategoriesItem = await this.mpSubCategoriesItemsService.createMPSubCategoriesItems(dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED,
      MPSubCategoriesItem,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Map Point Sub Categories Item'],
     response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED },
     softBlockExtraDtoFields: true,
   })
  @Get('admin/mp-sub-categories-items')
      async getAllMPSubCategoriesItems(@Res() response: Response, @Query() query:FilterQuery) {
        const MPSubCategoriesItem = await this.mpSubCategoriesItemsService.getAllMPSubCategoriesItems(query);
        return responseHelper(
          response,
          HttpStatus.OK,
          ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED,
          MPSubCategoriesItem,
          null,
          null,
        );
      }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories Item'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED },
  })
  @Put('admin/mp-sub-categories-items/:id')
   async updateMPSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateMPSubCategoriesItemsDto,
   ) {
     const MPSubCategoriesItem = await this.mpSubCategoriesItemsService.updateMPSubCategoriesItems(id, dto);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
       MPSubCategoriesItem,
       null,
       null,
     );
   }

  @ApiEndpoint({
    tags: ['Admin', 'Map Point Sub Categories Item'],
    response: { status: 200, description: ServerSuccess.MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED },
  })
  @Delete('admin/mp-sub-categories-items/:id')
  async deleteMPSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const MPSubCategoriesItem = await this.mpSubCategoriesItemsService.softDeleteMPSubCategoriesItems(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MAP_POINT_SUB_CATEGORIES_UPDATED,
      MPSubCategoriesItem,
      null,
      null,
    );
  }
}
