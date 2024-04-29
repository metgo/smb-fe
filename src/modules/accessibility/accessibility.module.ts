import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccessibilityController } from 'src/modules/accessibility/accessibility.controller';
import { AccessibilityService } from 'src/modules/accessibility/accessibility.service';
import { AccessibilitySchema } from 'src/modules/accessibility/schema/accessibility.schema';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Accessibility', schema: AccessibilitySchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  controllers: [AccessibilityController],
  providers: [AccessibilityService],
})
export class AccessibilityModule {}
