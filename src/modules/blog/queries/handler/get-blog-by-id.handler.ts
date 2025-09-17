import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetBlogByIdQuery } from '../get-blog-by-id.query';
import { Blog } from '../../schema/blog.schema';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { BlogStatus } from '../../blog.type';

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: Model<Blog>,
    private readonly externalApiService: ExternalApiServices,
  ) {}

  async execute(query: GetBlogByIdQuery): Promise<Blog> {
    try {
      const externalApiDetail
        = await this.externalApiService.findByIdentifierIdAndPopulateBlog(
          query.request.identifierId,
        );

      const blogDetails = externalApiDetail.blogIds.find(
        blog => blog._id.toString() === query.id.toString(),
      );

      if (!blogDetails || blogDetails.status !== BlogStatus.ACTIVE) {
        throw new NotFoundException('BLOG not found');
      }
      return blogDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
