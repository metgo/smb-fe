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
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { AccessibilityService } from './accessibility.service';
import { LocaleQuery } from './dto/locale-query.dto';
import { GetAllAccessibilityRequest } from './request/get-all-accessibility.request';
import { GetAllAccessibilityQuery } from './queries/get-all-accessibility.query';

@Controller()
export class AccessibilityController {
  constructor(
    private readonly accessibilityService: AccessibilityService,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiEndpoint({
    tags: ['Tourism-Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('tourism/accessibilities')
  async getAllAccessibilitiesForTourism(
    @Query() query: GetAllAccessibilityRequest,
  ) {
    const accessibilities = await this.queryBus.execute(
      new GetAllAccessibilityQuery(query),
    );
    return accessibilities;
  }

  @ApiEndpoint({
    tags: ['Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('accessibilities')
  async getAllAccessibilities(@Query() query: LocaleFilterQuery) {
    const accessibilities = await this.accessibilityService.getAll(query);
    return accessibilities;
  }

  @ApiEndpoint({
    tags: ['Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('admin/accessibility/:id')
  async getOneAccessibility(
    @Param('id') id: string,
    @Query() query: LocaleQuery,
  ) {
    const accessibility = await this.accessibilityService.getOne(id, query);
    return accessibility;
  }
}
