import { CreateOrderDto } from 'src/modules/external-api/dto/create-order.dto';

export interface CreateOrderCommand {
  loggedInUserId: string;
  body: CreateOrderDto;
  redeemedVouchers: [];
  totalAmount: number;
  actualAmountOfProduct: number;
  identifierId: string;
}
