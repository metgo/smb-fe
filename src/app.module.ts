import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import dbConfig from 'src/core/dbConfig';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forRoot(dbConfig.uri),
    ConfigModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})

export class AppModule {}
