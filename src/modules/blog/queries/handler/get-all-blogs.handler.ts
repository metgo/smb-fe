import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetAllBlogsQuery } from '../get-all-blogs.query';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { BlogStatus } from '../../blog.type';

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(private readonly externalApiService: ExternalApiServices) {}

  async execute(query: GetAllBlogsQuery): Promise<any> {
    try {
      const data = await this.externalApiService.findByIdentifierIdAndPopulateBlog(
        query.request.identifierId,
      );

      return await Promise.all(
        data.blogIds
          .filter(blog => blog.status === BlogStatus.ACTIVE)
          .map(blog => ({
            _id: blog._id,
            title: blog.title,
            subTitle: blog.subTitle,
            images: blog.images,
          })),
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
