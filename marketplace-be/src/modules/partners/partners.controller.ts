import {
  Controller, Get, Param, Query,
} from '@nestjs/common';

import { Locale } from 'src/common/enum';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { PartnersService } from './partners.service';

@Controller()
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @ApiEndpoint({
    tags: ['Partners'],
  })
  @Get('partners/:websiteId')
  async getAll(
    @Param('websiteId') websiteId: string,
    @Query('locale') locale: Locale = Locale.HEBREW,
  ) {
    const partners = await this.partnersService.getAll(websiteId, locale);
    return partners;
  }
}
