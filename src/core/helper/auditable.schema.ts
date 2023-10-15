import { Prop } from '@nestjs/mongoose';

// eslint-disable-next-line no-use-before-define

export abstract class AuditableSchema {
    @Prop({ default: new Date() })
      createdAt: Date;

    @Prop({ default: null })
      updatedAt: Date;

    @Prop({ default: null })
      createdBy?: string; // need to update update accoring to user referene

     @Prop({ default: null })
       updatedBy?: string; // need to update update accoring to user referene

    @Prop({ default: null })
      deletedBy?: string; // need to update update accoring to user referene

    @Prop({ default: null })
      deletedAt?: string;
}
