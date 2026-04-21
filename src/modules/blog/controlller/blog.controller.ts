/* eslint-disable no-undef */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Locale } from 'src/common/enum';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetBlogBySlugQuery } from '../queries/get-blog-by-slug.query';
import { GetAllBlogsQuery } from '../queries/get-all-blogs.query';
import { GetAllBlogsRequest } from '../queries/get-all-blogs.request';

@Controller('blogs')
export class BlogController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Blog'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:slug')
  async getBlogById(
    @Param('slug') slug: string,
    @Query('locale') locale: Locale = Locale.HEBREW,
  ) {
    return this.queryBus.execute(new GetBlogBySlugQuery(slug, locale));
  }

  @ApiEndpoint({
    tags: ['Tourism-Blog'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getAllBlogs(@Query() query: GetAllBlogsRequest) {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }
}
