import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { VoucherTemplateController } from './voucher-template.controller';
import { VoucherTemplateService } from './voucher-template.service';
import { VoucherTemplateSchema } from './schema/voucher-template.schema';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'VoucherTemplate', schema: VoucherTemplateSchema },
    ]),
    UsersModule,
    GcpBucketModule,
  ],
  controllers: [VoucherTemplateController],
  providers: [VoucherTemplateService],
})
export class VoucherTemplateModule {}
