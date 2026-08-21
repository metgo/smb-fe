import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DocUpload, DocUploadSchema } from './schema/doc-upload.schema';
import { DocUploadService } from './doc-upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DocUpload.name,
        schema: DocUploadSchema,
      },
    ]),
  ],
  providers: [DocUploadService],
  controllers: [],
  exports: [DocUploadService],
})
export class DocUploadModule {}
