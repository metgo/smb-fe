import { Module } from '@nestjs/common';
import { HashService } from 'src/services/hash/hash.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
