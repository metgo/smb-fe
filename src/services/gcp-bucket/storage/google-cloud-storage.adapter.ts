import { Storage } from '@google-cloud/storage';
import { StorageAdapter } from 'src/services/gcp-bucket/storage/storage';

export class GoogleCloudStorageAdapter implements StorageAdapter {
  private readonly storageClient: Storage;

  constructor(
    private readonly config: {
      readonly bucket: string;
      readonly visibility?: 'public' | 'private';
      readonly projectId: string;
      readonly keyFilename: string;
    },
  ) {
    this.storageClient = new Storage({
      projectId: this.config.projectId,
      keyFilename: this.config.keyFilename,
    });
  }

  async upload(location: string, content: Buffer) {
    await this.storageClient
      .bucket(this.config.bucket)
      .file(location)
      .save(content, {
        public: this.config.visibility === 'public',
      });
  }

  getUrl(location: string) {
    return `https://storage.googleapis.com/${this.config.bucket}/${location}`;
  }

  async delete(url: string) {
    const location = url.split(`https://storage.googleapis.com/${this.config.bucket}/`)[1];

    await this.storageClient.bucket(this.config.bucket).file(location).delete();
  }
}
