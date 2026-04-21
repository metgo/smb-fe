/* eslint-disable no-nested-ternary */
import { CommonStatus, Locale } from 'src/common/enum';
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
      const { locale } = query.request;
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

            const localized = this.localizeBlog(blog, locale);

            return {
              _id: blog._id,
              title: localized.title,
              slug: blog.slug,
              shortDescription: localized.shortDescription,
              image:
                blog.images.find(img => img?.isPrimary)
                ?? blog.images[0]
                ?? null,
              tags: localized.tags,
              readTime: Math.ceil(
                localized.content.trim().split(/\s+/).length / 200,
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

  private localizeBlog(blog: any, locale: Locale) {
    switch (locale) {
      case Locale.ARABIC:
        return {
          title: blog.titleAr || blog.title || blog.titleHe,
          shortDescription:
            blog.shortDescriptionAr
            || blog.shortDescription
            || blog.shortDescriptionHe,
          content: blog.contentAr || blog.content || blog.contentHe,
          tags: blog.tagsAr?.length
            ? blog.tagsAr
            : blog.tags?.length
              ? blog.tags
              : blog.tagsHe,
        };
      case Locale.ENGLISH:
        return {
          title: blog.title || blog.titleHe || blog.titleAr,
          shortDescription:
            blog.shortDescription
            || blog.shortDescriptionHe
            || blog.shortDescriptionAr,
          content: blog.content || blog.contentHe || blog.contentAr,
          tags: blog.tags?.length
            ? blog.tags
            : blog.tagsHe?.length
              ? blog.tagsHe
              : blog.tagsAr,
        };
      case Locale.HEBREW:
      default:
        return {
          title: blog.titleHe || blog.title || blog.titleAr,
          shortDescription:
            blog.shortDescriptionHe
            || blog.shortDescription
            || blog.shortDescriptionAr,
          content: blog.contentHe || blog.content || blog.contentAr,
          tags: blog.tagsHe?.length
            ? blog.tagsHe
            : blog.tags?.length
              ? blog.tags
              : blog.tagsAr,
        };
    }
  }
}
