import { Module } from '@nestjs/common';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { StorageProvider } from 'src/services/gcp-bucket/provider/storage.provider';

@Module({
  providers: [GcpBucketService, StorageProvider],
  exports: [GcpBucketService],
})
export class GcpBucketModule {}
