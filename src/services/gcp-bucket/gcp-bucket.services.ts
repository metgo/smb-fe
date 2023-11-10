/* eslint-disable no-undef */
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { extname, join } from 'path';

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
    const mediaNamespace = `${new Date().getUTCFullYear()}/${new Date().getMonth()}`;
    const relativePath = join(mediaNamespace, mediaName);

    await this.storage.upload(relativePath, file.buffer);

    const mediaUrl = this.storage.getUrl(relativePath);
    return mediaUrl;
  }

  async update(existingUrl: string, file:Express.Multer.File) {
    const newMediaUrl = await this.upload(file);

    await this.delete(existingUrl);

    return newMediaUrl;
  }

  async delete(url: string) {
    await this.storage.delete(url);

    return 'Deleted Successfully!!';
  }
}
