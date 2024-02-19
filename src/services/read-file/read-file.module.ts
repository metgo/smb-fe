import { Module } from '@nestjs/common';

import { ReadFileController } from 'src/services/read-file/read-file.controller';
import { ReadFileService } from 'src/services/read-file/read-file.service';

@Module({
  controllers: [ReadFileController],
  providers: [ReadFileService],
})
export class ReadFileModule {}
