import {
  Controller, Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { FilterQuery } from './dto';

@Controller()
export class BussSubCategoriesController {
  constructor(
    private readonly bussSubCategoriesService: BussSubCategoriesService,
  ) {}

  @ApiEndpoint({
    tags: ['Admin', 'Business Sub-Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @Get('admin/buss-sub-category')
  async getAll(@Res() response: Response, @Query() query: FilterQuery) {
    const bussSubCategory = await this.bussSubCategoriesService.getAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
      bussSubCategory,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Business Sub-Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @Get('admin/buss-sub-category/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('locale') locale: Locale,
  ) {
    const bussSubCategory = await this.bussSubCategoriesService.getOne(
      id,
      locale,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
      bussSubCategory,
      null,
      null,
    );
  }
}
