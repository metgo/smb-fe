import { Provider } from '@nestjs/common';

import mediaConfig from 'src/services/config/gcp-bucket';
import {
  GoogleCloudStorageAdapter,
  Storage,
} from 'src/services/gcp-bucket/storage';
import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

export const StorageProvider = {
  provide: 'Storage',
  useFactory: () => {
    const adapter = new GoogleCloudStorageAdapter({
      bucket: mediaConfig.bucketName,
      visibility: 'public',
      projectId: configService.get('GCS_PROJECT_ID'),
      keyFilename: configService.get('GCS_FILE_PATH'),
    });
    return new Storage(adapter);
  },
} as Provider;
