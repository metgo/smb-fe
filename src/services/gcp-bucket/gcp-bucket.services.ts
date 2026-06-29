/* eslint-disable no-undef */
import {
  BadRequestException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { extname, join } from 'path';
import { defaultMetGoLogoURL } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { Storage } from 'src/services/gcp-bucket/storage';

@Injectable()
export class GcpBucketService {
  constructor(
    @Inject('Storage')
    readonly storage: Storage,
  ) {}

  async upload(file: Express.Multer.File) {
    if (file.size > 5000000) {
      throw new UnprocessableEntityException('File must not exceed 5mb');
    }

    const mediaName = `${nanoid(16)}${extname(file.originalname)}`;
    const year = new Date().getUTCFullYear();
    const month = String(new Date().getUTCMonth() + 1).padStart(2, '0');
    const mediaNamespace = `${year}/${month}`;
    const relativePath = join(mediaNamespace, mediaName);

    try {
      await this.storage.upload(relativePath, file.buffer);
      const mediaUrl = this.storage.getUrl(relativePath);

      if (!mediaUrl) {
        throw new Error('GCP storage returned empty URL');
      }

      console.log('[GCP]: Upload successful', {
        originalName: file.originalname,
        relativePath,
        mediaUrl,
      });
      return mediaUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[GCP]: Upload failed', {
        originalName: file.originalname,
        relativePath,
        fileSize: file.size,
        error: errorMsg,
      });
      throw new UnprocessableEntityException(`GCP upload failed: ${errorMsg}`);
    }
  }

  async update(existingUrl: string, file: Express.Multer.File) {
    const newMediaUrl = await this.upload(file);

    if (existingUrl !== defaultMetGoLogoURL) await this.delete(existingUrl);

    return newMediaUrl;
  }

  async delete(url: string) {
    try {
      if (url !== defaultMetGoLogoURL) await this.storage.delete(url);

      return 'Deleted Successfully!!';
    } catch (err) {
      if (err?.message === 'A file name must be specified.') {
        throw new BadRequestException(
          "Sorry, we couldn't find the image at that URL.",
        );
      }
      if (err?.errors[0]?.reason === 'notFound') {
        throw new BadRequestException(
          "Sorry, we couldn't find the image at that URL.",
        );
      }
      exceptionHandling(err);
    }
  }
}
