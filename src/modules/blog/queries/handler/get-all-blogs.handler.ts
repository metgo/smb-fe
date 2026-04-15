import { CommonStatus } from 'src/common/enum';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetAllBlogsQuery } from '../get-all-blogs.query';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { User } from 'src/modules/users/schema/users.schema';

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(
    private readonly externalApiService: ExternalApiServices,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  async execute(query: GetAllBlogsQuery): Promise<any[]> {
    try {
      const data
        = await this.externalApiService.findByIdentifierIdAndPopulateBlog(
          query.request.identifierId,
        );

      return await Promise.all(
        data.blogIds
          .filter(blog => blog.status === CommonStatus.APPROVED)
          .map(async blog => {
            const userId = blog.updatedBy || blog.createdBy;
            const user = userId
              ? await this.UserModel.findById(userId).select(
                'firstName lastName',
              )
              : null;

            return {
              _id: blog._id,
              title: blog.title,
              slug: blog.slug,
              shortDescription: blog.shortDescription,
              image:
                blog.images.find(img => img?.isPrimary)
                ?? blog.images[0]
                ?? null,
              tags: blog.tags,
              readTime: Math.ceil(
                blog.content.trim().split(/\s+/).length / 200,
              ),
              updatedAt: blog.updatedAt || blog.createdAt,
              updatedBy: user ? `${user?.firstName} ${user?.lastName}` : null,
            };
          }),
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
