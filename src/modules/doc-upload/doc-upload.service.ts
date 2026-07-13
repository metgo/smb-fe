import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { DocUpload } from './schema/doc-upload.schema';

@Injectable()
export class DocUploadService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(DocUpload.name)
    private readonly DocUploadModel: Model<DocUpload>,
  ) {}

  async getImageUrlByExternalApiAndTemplate(
    externalApiId: string,
    templateKey: string,
  ): Promise<string | null> {
    try {
      const doc = await this.DocUploadModel.findOne({
        externalApiId,
        templateKey,
        isDeleted: { $ne: true },
      }).select('imageUrl');

      return doc?.imageUrl || null;
    } catch (err) {
      this.logger.error('[DOC_UPLOAD]: FAILED TO GET IMAGE URL', {
        err: err.message,
      });
      return null;
    }
  }
}
