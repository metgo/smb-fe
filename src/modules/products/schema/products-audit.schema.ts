import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from './products.schema';

@Schema({ timestamps: true })
export class ProductsAudit extends Product {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
    productId: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 1 })
    version: number;

  @Prop({ default: true, index: true })
    isActive: boolean;
}

export const ProductsAuditSchema = SchemaFactory.createForClass(ProductsAudit);

ProductsAuditSchema.index({ productId: 1, isActive: 1 });
ProductsAuditSchema.index({ productId: 1, version: -1 });
ProductsAuditSchema.index({ slug: 1 });
ProductsAuditSchema.index({
  name: 'text',
  nameHe: 'text',
  nameAr: 'text',
  description: 'text',
  descriptionHe: 'text',
  descriptionAr: 'text',
});

export type ProductsAuditDocument = HydratedDocument<ProductsAudit>;
