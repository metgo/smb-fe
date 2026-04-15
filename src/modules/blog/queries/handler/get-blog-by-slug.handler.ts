import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetBlogBySlugQuery } from '../get-blog-by-slug.query';
import { Blog } from '../../schema/blog.schema';
import { User } from 'src/modules/users/schema/users.schema';

@QueryHandler(GetBlogBySlugQuery)
export class GetBlogBySlugHandler implements IQueryHandler<GetBlogBySlugQuery> {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: Model<Blog>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  async execute(query: GetBlogBySlugQuery): Promise<any> {
    try {
      const blog = await this.BlogModel.findOne({
        slug: query.slug,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
      })
        .select(
          '_id slug title subTitle shortDescription content summary metaTitle metaDescription tags images createdAt updatedAt createdBy updatedBy',
        )
        .lean()
        .exec();

      if (!blog) {
        throw new NotFoundException('BLOG not found');
      }

      const userId = blog.updatedBy || blog.createdBy;
      const user = userId
        ? await this.UserModel.findById(userId).select('firstName lastName')
        : null;
      return {
        ...blog,
        readTime: Math.ceil(blog.content.trim().split(/\s+/).length / 200),
        updatedAt: blog.updatedAt || blog.createdAt,
        updatedBy: user ? `${user?.firstName} ${user?.lastName}` : null,
      };
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
