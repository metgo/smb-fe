import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { GetAllSubCategoriesQuery } from './queries/get-all-subcategories.query';
import { GetSubCategoryQuery } from './queries/get-subcategory.query';

@Controller()
export class BussSubCategoriesController {
  constructor(
    private readonly bussSubCategoriesService: BussSubCategoriesService,
  ) {}

  @ApiEndpoint({
    tags: ['Business Sub-Categories'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('subcategory')
  async getAll(@Query() query: GetAllSubCategoriesQuery) {
    const bussSubCategories = await this.bussSubCategoriesService.getAll(query);

    return bussSubCategories;
  }

  @ApiEndpoint({
    tags: ['Business Sub-Categories'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('subcategory/:id')
  async getOne(@Param('id') id: string, @Query() query: GetSubCategoryQuery) {
    const bussSubCategory = await this.bussSubCategoriesService.getOne(
      id,
      query,
    );

    return bussSubCategory;
  }
}
