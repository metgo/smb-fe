import mongoose from 'mongoose';

export interface CreateOrderProductCommand {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  loggedInUserId?: mongoose.Types.ObjectId | string;
  orderId: string;
}
