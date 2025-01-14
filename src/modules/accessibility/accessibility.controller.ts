import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { AccessibilityService } from './accessibility.service';
import { LocaleQuery } from './dto/locale-query.dto';

@Controller()
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility')
  async getAll(@Res() response: Response, @Query() query: LocaleFilterQuery) {
    const accessibility = await this.accessibilityService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      accessibility,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query() query: LocaleQuery,
  ) {
    const accessibility = await this.accessibilityService.getOne(id, query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      accessibility,
      null,
      null,
    );
  }

}
