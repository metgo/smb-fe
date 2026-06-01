import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { Blog } from './schema/blog.schema';
import { User } from '../users/schema/users.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: Model<Blog>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  async getAllBlogs(externalApiId: string, locale: Locale): Promise<any[]> {
    try {
      const blogs = await this.BlogModel.find({
        externalApiId,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
      })
        .select(
          '_id slug title titleHe titleAr shortDescription shortDescriptionHe shortDescriptionAr content contentHe contentAr tags tagsHe tagsAr images createdAt updatedAt createdBy updatedBy',
        )
        .lean()
        .exec();

      return await Promise.all(
        blogs.map(async blog => {
          const userId = blog.updatedBy || blog.createdBy;
          const user = userId
            ? await this.UserModel.findById(userId).select('firstName lastName')
            : null;

          const localized = this.localizeBlog(blog, locale);

          return {
            _id: blog._id,
            title: localized.title,
            slug: blog.slug,
            shortDescription: localized.shortDescription,
            image:
              blog.images.find(img => img?.isPrimary) ?? blog.images[0] ?? null,
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

  async getBlogDetails(slug: string, locale: Locale): Promise<any> {
    try {
      const blog = await this.BlogModel.findOne({
        slug,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
      })
        .select(
          '_id slug title titleHe titleAr subTitle subTitleHe subTitleAr shortDescription shortDescriptionHe shortDescriptionAr content contentHe contentAr summary summaryHe summaryAr metaTitle metaTitleHe metaTitleAr metaDescription metaDescriptionHe metaDescriptionAr tags tagsHe tagsAr images createdAt updatedAt createdBy updatedBy',
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

      const localized = this.localizeBlog(blog, locale);

      return {
        _id: blog._id,
        slug: blog.slug,
        images: blog.images,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt || blog.createdAt,
        updatedBy: user ? `${user?.firstName} ${user?.lastName}` : null,
        readTime: Math.ceil(localized.content.trim().split(/\s+/).length / 200),
        ...localized,
      };
    } catch (error) {
      exceptionHandling(error);
    }
  }

  private localizeBlog(blog: any, locale: Locale) {
    switch (locale) {
      case Locale.ARABIC:
        return {
          title: blog.titleAr || blog.title || blog.titleHe,
          subTitle: blog.subTitleAr || blog.subTitle || blog.subTitleHe,
          shortDescription:
            blog.shortDescriptionAr
            || blog.shortDescription
            || blog.shortDescriptionHe,
          content: blog.contentAr || blog.content || blog.contentHe,
          summary: blog.summaryAr || blog.summary || blog.summaryHe,
          metaTitle: blog.metaTitleAr || blog.metaTitle || blog.metaTitleHe,
          metaDescription:
            blog.metaDescriptionAr
            || blog.metaDescription
            || blog.metaDescriptionHe,
          tags: (blog.tagsAr?.length && blog.tagsAr) || (blog.tags?.length && blog.tags) || blog.tagsHe,
        };
      case Locale.ENGLISH:
        return {
          title: blog.title || blog.titleHe || blog.titleAr,
          subTitle: blog.subTitle || blog.subTitleHe || blog.subTitleAr,
          shortDescription:
            blog.shortDescription
            || blog.shortDescriptionHe
            || blog.shortDescriptionAr,
          content: blog.content || blog.contentHe || blog.contentAr,
          summary: blog.summary || blog.summaryHe || blog.summaryAr,
          metaTitle: blog.metaTitle || blog.metaTitleHe || blog.metaTitleAr,
          metaDescription:
            blog.metaDescription
            || blog.metaDescriptionHe
            || blog.metaDescriptionAr,
          tags: (blog.tags?.length && blog.tags) || (blog.tagsHe?.length && blog.tagsHe) || blog.tagsAr,
        };
      case Locale.HEBREW:
      default:
        return {
          title: blog.titleHe || blog.title || blog.titleAr,
          subTitle: blog.subTitleHe || blog.subTitle || blog.subTitleAr,
          shortDescription:
            blog.shortDescriptionHe
            || blog.shortDescription
            || blog.shortDescriptionAr,
          content: blog.contentHe || blog.content || blog.contentAr,
          summary: blog.summaryHe || blog.summary || blog.summaryAr,
          metaTitle: blog.metaTitleHe || blog.metaTitle || blog.metaTitleAr,
          metaDescription:
            blog.metaDescriptionHe
            || blog.metaDescription
            || blog.metaDescriptionAr,
          tags: (blog.tagsHe?.length && blog.tagsHe) || (blog.tags?.length && blog.tags) || blog.tagsAr,
        };
    }
  }
}
