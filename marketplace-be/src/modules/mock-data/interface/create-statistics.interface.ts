import mongoose from 'mongoose';

export interface CreateImpressionEngagementInterface {
  businessId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
}
