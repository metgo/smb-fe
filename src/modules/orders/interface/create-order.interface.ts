import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';

export interface CreateOrderCommand {
  loggedInUserId: string | null;
  body: CreateOrderDto;
  redeemedVouchers: [];
  totalAmount: number;
  actualAmountOfProduct: number;
}
