import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

const storageFolderMap = {
  gcs: configService.get('MEDIA_STORAGE_FOLDER'),
};

export default {
  storageFolder: storageFolderMap.gcs,
  bucketName: configService.get('GCS_BUCKET'),
};
