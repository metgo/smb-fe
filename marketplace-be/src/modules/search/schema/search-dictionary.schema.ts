import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class SearchDictionary {
  @Prop({ required: true, index: true })
    keyword: string;

  @Prop({ default: null })
    websiteUrl: string;

  @Prop({ default: 1 })
    count: number;
}

export const SearchDictionarySchema
  = SchemaFactory.createForClass(SearchDictionary);

SearchDictionarySchema.index({ keyword: 1, websiteUrl: 1 }, { unique: true });

export type SearchDictionaryDocument = HydratedDocument<SearchDictionary>;
