import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { Blog, BlogSchema } from './schema/blog.schema';
import { BlogController } from './controlller/blog.controller';
import { GetBlogBySlugHandler } from './queries/handler/get-blog-by-slug.handler';
import { GetAllBlogsHandler } from './queries/handler/get-all-blogs.handler';
import {
  ExternalApi,
  ExternalApiSchema,
} from '../external-api/schema/external-api.schema';
import { ExternalApiModule } from '../external-api/external-api.module';
import { User, UserSchema } from '../users/schema/users.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
    ExternalApiModule,
  ],
  providers: [GetAllBlogsHandler, GetBlogBySlugHandler],
  controllers: [BlogController],
})
export class BlogModule {}
