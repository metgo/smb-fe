import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { GetSubCategoryQuery } from './queries/get-subcategory.query';
import { GetAllSubCategoriesRequest } from './requests/get-all-subcategories.request';
import { GetAllSubCategoriesQuery } from './queries/get-all-subcategories.query';

@Controller()
export class BussSubCategoriesController {
  constructor(
    private readonly queryBus: QueryBus,
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
  async getAll(@Query() query: GetAllSubCategoriesRequest) {
    const bussSubCategories = await this.queryBus.execute(
      new GetAllSubCategoriesQuery(query),
    );

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
