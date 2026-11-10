import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PunchCardsService } from './punch-cards.service';
import { PunchCard, PunchCardSchema } from './schema/punch-card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PunchCard.name, schema: PunchCardSchema },
    ]),
  ],
  providers: [PunchCardsService],
  exports: [PunchCardsService, MongooseModule],
})
export class PunchCardsModule {}
