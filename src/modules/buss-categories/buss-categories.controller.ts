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

import { BussCategoriesService } from './buss-categories.service';
import { GetAllCategoriesRequest } from './requests/get-all-categories.request';
import { GetCategoryQuery } from './queries/get-category-query';
import { GetAllCategoriesQuery } from './queries/get-all-categories.query';
import { QueryBus } from '@nestjs/cqrs';

@Controller()
export class BussCategoriesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly bussCategoryService: BussCategoriesService,
  ) {}

  @ApiEndpoint({
    tags: ['Business-Categories'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('categories')
  async getAll(@Query() query: GetAllCategoriesRequest) {
    const allBussCategoires = await this.queryBus.execute(
      new GetAllCategoriesQuery(query),
    );

    return allBussCategoires;
  }

  @ApiEndpoint({
    tags: ['Business-Categories'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('categories/:id')
  async getOne(@Param('id') id: string, @Query() query: GetCategoryQuery) {
    const bussCategory = await this.bussCategoryService.getOne(id, query);

    return bussCategory;
  }
}
