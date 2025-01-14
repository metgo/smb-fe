import {
  Controller, Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';

import { responseHelper } from 'src/core/helper/response.helper';
import { BussCategoriesService } from './buss-categories.service';

@Controller()
export class BussCategoriesController {
  constructor(private readonly bussCategoryService: BussCategoriesService) {}

  @ApiEndpoint({
    tags: ['Admin', 'Business-Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @Get('admin/buss-category')
  async getAll(@Res() response: Response, @Query() query: LocaleFilterQuery) {
    const allBussCategoires = await this.bussCategoryService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.LISTED,
      allBussCategoires,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Business-Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Get('admin/buss-category/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('locale') locale: Locale,
  ) {
    const bussCategory = await this.bussCategoryService.getOne(id, locale);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.LISTED,
      bussCategory,
      null,
      null,
    );
  }
}
