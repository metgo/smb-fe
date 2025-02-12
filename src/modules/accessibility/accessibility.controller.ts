import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { AccessibilityService } from './accessibility.service';
import { LocaleQuery } from './dto/locale-query.dto';

@Controller()
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @ApiEndpoint({
    tags: ['Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('accessibilities')
  async getAll(@Query() query: LocaleFilterQuery) {
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
  async getOne(@Param('id') id: string, @Query() query: LocaleQuery) {
    const accessibility = await this.accessibilityService.getOne(id, query);
    return accessibility;
  }
}
