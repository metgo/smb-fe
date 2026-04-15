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

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetBlogBySlugQuery } from '../queries/get-blog-by-slug.query';
import { GetAllBlogsQuery } from '../queries/get-all-blogs.query';
import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';

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
  async getBlogById(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetBlogBySlugQuery(slug));
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
  async getAllBlogs(@Query() query: ExternalApiPostQuery) {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }
}
