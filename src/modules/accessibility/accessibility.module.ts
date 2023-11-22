import { Module } from '@nestjs/common';
import { AccessibilityController } from './accessibility.controller';
import { AccessibilityService } from './accessibility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessibilitySchema } from './schema/accessibility.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Accessibility', schema: AccessibilitySchema },
    ]),
    UsersModule,
  ],
  controllers: [AccessibilityController],
  providers: [AccessibilityService],
})
export class AccessibilityModule {}
