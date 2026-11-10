import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { Theme, ThemeSchema } from './schema/theme.schema';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { FindByIdHandler } from './queries/handler/find-by-id.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Theme.name, schema: ThemeSchema }]),
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  providers: [FindByIdHandler],
})
export class ThemeModule {}
