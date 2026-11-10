/* eslint-disable no-undef */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { Locale } from 'src/common/enum';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { BlogService } from './blog.service';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiEndpoint({
    tags: ['Article'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:slug')
  async getBlogDetails(
    @Param('slug') slug: string,
    @Query('locale') locale: Locale = Locale.HEBREW,
  ) {
    return this.blogService.getBlogDetails(slug, locale);
  }

  @ApiEndpoint({
    tags: ['Article'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getAllBlogs(
    @Query('externalApiId') externalApiId: string,
    @Query('locale') locale: Locale = Locale.HEBREW,
  ) {
    return this.blogService.getAllBlogs(externalApiId, locale);
  }
}
