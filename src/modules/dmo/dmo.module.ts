import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DMOSchema } from './schema/dmo.schema';
import { DMOService } from './dmo.service';
import { DMOController } from './dmo.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DMO', schema: DMOSchema },
    ]),
    UsersModule,
  ],
  providers: [DMOService],
  controllers: [DMOController],
  exports: [DMOService],
})
export class DMOModule {}
