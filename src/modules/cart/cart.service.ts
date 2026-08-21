import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ObjectId } from 'typeorm';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { updateById } from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { Cart } from 'src/modules/cart/cart.schema';
import { CartStatus } from 'src/modules/cart/cart.types';
import { AddToCartDto } from 'src/modules/cart/dto/add-to-cart.dto';
import { UpdateCartDto } from 'src/modules/cart/dto/update-cart.dto';
import { ProductsService } from 'src/modules/products/products.services';
import { OrderItemType } from '../orders/orders.type';
import { GetTicketByIdQuery } from '../tickets/queries/get-ticket-by-id.query';
import { DeleteItemFromCartDto } from './dto/delete-item-from-cart.dto';
import { AddItemsToCartDto } from './dto/add-items-to-cart.dto';
import { AddVendorWiseProductsToCartDto } from './dto/add-vendor-wise-products-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly queryBus: QueryBus,
    @InjectModel(Cart.name)
    private CartModel: Model<Cart>,
    private campaignService: CampaignService,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
  ) {}

  async createCart(
    command: AddToCartDto,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      if (!command?.product) {
        throw new BadRequestException('Enter valid product details');
      }

      if (!command?.product?.quantity) {
        throw new BadRequestException('Enter quantity');
      }

      if (!command?.product?.itemType) {
        throw new BadRequestException('Enter type of item');
      }

      let campId;
      if (command?.campCode) {
        campId = (
          await this.campaignService.findCampaignAndReturn(
            'code',
            command?.campCode,
          )
        )?._id;
      }

      let itemInfo;

      if (command.product.itemType === OrderItemType.PRODUCT) {
        itemInfo = await this.productsService.getProductInformationForCart(
          command.product,
        );
      }

      if (command.product.itemType === OrderItemType.TICKET) {
        itemInfo = await this.queryBus.execute(
          new GetTicketByIdQuery(command.product.id),
        );
      }

      const totalAmount
        = itemInfo?.price?.sellingPrice * command.product.quantity;

      const newCart = new this.CartModel({
        product: command?.product,
        createdBy: loggedInUser?.id,
        createdAt: new Date(),
        totalAmount,
        campId,
        vendorProducts: [], // Explicitly set empty array to prevent inconsistency
      });

      // const availableProducts
      //   = await this.productsService.checkTofreezeQuantity(command.product);

      // if (!availableProducts) {
      //   this.logger.error(
      //     `[${command.identifierId} - CART]: FAILED TO ADD ITEM TO CART`,
      //     {
      //       err: 'You entered more product than available',
      //     },
      //   );
      //   throw new BadRequestException(
      //     'Insufficient quantity for given product',
      //   );
      // }

      const cart = await newCart.save();

      // await this.productsService.freezeQuantity(
      //   command.product,
      //   newCart._id,
      //   loggedInUser,
      // );
      this.logger.info(`[${command.campCode} - CART]: Product added to cart`, {
        message: cart,
      });

      return cart;
    } catch (error) {
      this.logger.error(
        `[${command.campCode} - CART]: FAILED TO ADD ITEM TO CART`,
        {
          err: error instanceof Error ? error.message : String(error),
        },
      );
      exceptionHandling(error);
    }
  }

  async createCartForMultipleProducts(
    command: AddItemsToCartDto,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      if (!command?.products || !command.products.length) {
        throw new BadRequestException('Enter valid product details');
      }

      // Validate all products
      // eslint-disable-next-line array-callback-return
      command.products.map(product => {
        if (!product?.quantity) {
          throw new BadRequestException('Enter quantity for all product');
        }

        if (!product?.itemType) {
          throw new BadRequestException('Enter type of item for all product');
        }

        if (!product?.id) {
          throw new BadRequestException('Enter product id for all product');
        }
      });

      let campId;
      if (command?.campCode) {
        campId = (
          await this.campaignService.findCampaignAndReturn(
            'code',
            command?.campCode,
          )
        )?._id;
      }

      // Fetch information for all products
      const productsWithInfo = await Promise.all(
        command.products.map(async product => {
          let itemInfo;

          if (product.itemType === OrderItemType.PRODUCT) {
            itemInfo = await this.productsService.getProductInformationForCart(
              product,
            );
          }

          if (product.itemType === OrderItemType.TICKET) {
            itemInfo = await this.queryBus.execute(
              new GetTicketByIdQuery(product.id),
            );
          }

          if (!itemInfo) {
            throw new NotFoundException(
              `Product/Ticket with id ${product.id} not found`,
            );
          }

          return {
            id: product.id,
            quantity: product.quantity,
            itemType: product.itemType,
            price: itemInfo?.price?.sellingPrice,
          };
        }),
      );

      const totalAmount = productsWithInfo.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
      );

      const processedProducts = productsWithInfo.map(product => ({
        id: product.id,
        quantity: product.quantity,
        itemType: product.itemType,
      }));

      const newCart = new this.CartModel({
        product: processedProducts,
        createdBy: loggedInUser?.id,
        createdAt: new Date(),
        totalAmount,
        campId,
      });

      const cart = await newCart.save();

      this.logger.info(`[${command.campCode} - CART]: Products added to cart`, {
        message: cart,
      });

      return cart;
    } catch (error) {
      this.logger.error(
        `[${command.campCode} - CART]: FAILED TO ADD ITEMS TO CART`,
        {
          err: error instanceof Error ? error.message : String(error),
        },
      );
      exceptionHandling(error);
    }
  }

  async updateCart(
    cartId: string,
    command: UpdateCartDto,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      const existingCart = await this.findOneById(cartId);

      if (
        existingCart?.status === CartStatus.TIME_OUT
        || existingCart?.status === CartStatus.ORDER_PLACED
      ) {
        throw new BadRequestException(
          'This cart is no longer available to update',
        );
      }

      const productIndex = existingCart?.product.findIndex(
        product => product.id.toString() === command.productId.toString(),
      );

      let existingProductInCart: any = existingCart?.product;

      if (productIndex !== -1) {
        existingProductInCart[productIndex].quantity = command?.quantity;
        existingProductInCart[productIndex].email = command?.email;
        existingProductInCart[productIndex].countryCode = command?.countryCode;
        existingProductInCart[productIndex].phone = command?.phone;
        existingProductInCart[productIndex].firstName = command?.firstName;
        existingProductInCart[productIndex].lastName = command?.lastName;
        existingProductInCart[productIndex].deliveryMethod
          = command?.deliveryMethod;
        existingProductInCart[productIndex].deliveryArea
          = command?.deliveryArea;
        existingProductInCart[productIndex].deliveryPickupLocation
          = command?.deliveryPickupLocation;
        existingProductInCart[productIndex].deliveryFee = command?.deliveryFee;
        existingProductInCart[productIndex].houseNo = command?.houseNo;
        existingProductInCart[productIndex].apartment = command?.apartment;
        existingProductInCart[productIndex].city = command?.city;
        existingProductInCart[productIndex].street = command?.street;
        existingProductInCart[productIndex].isGift = command?.isGift;
        existingProductInCart[productIndex].additionalInfo
          = command?.additionalInfo;
        existingProductInCart[productIndex].itemType = command?.itemType;
      } else {
        // Add new product item to the cart if it doesn't exist
        existingProductInCart.push({
          id: new mongoose.Types.ObjectId(command.productId),
          quantity: command?.quantity,
          email: command?.email,
          countryCode: command?.countryCode,
          phone: command?.phone,
          firstName: command?.firstName,
          lastName: command?.lastName,
          deliveryFee: command?.deliveryFee,
          deliveryMethod: command?.deliveryMethod,
          deliveryArea: command?.deliveryArea,
          deliveryPickupLocation: command?.deliveryPickupLocation,
          houseNo: command?.houseNo,
          city: command?.city,
          street: command?.street,
          isGift: command?.isGift,
          apartment: command?.apartment,
          additionalInfo: command?.additionalInfo,
          itemType: command?.itemType,
        });
      }

      existingProductInCart = existingProductInCart.filter(
        product => product.quantity > 0,
      );

      const productIds = existingProductInCart.filter(
        op => op.itemType === OrderItemType.PRODUCT,
      );

      const ticketIds = existingProductInCart.filter(
        op => op.itemType === OrderItemType.TICKET,
      );

      let totalAmount;
      if (productIds?.length) {
        const productInformation = await Promise.all(
          productIds?.map(product => this.productsService.getProductInformationForCart(product)),
        );

        totalAmount = productInformation.reduce(
          (total, pro, index) => total + pro.price.sellingPrice * productIds[index].quantity,
          0,
        );
      }

      if (ticketIds?.length) {
        const ticketInformation = await Promise.all(
          ticketIds?.map(
            async ticket => await this.queryBus.execute(new GetTicketByIdQuery(ticket.id)),
          ),
        );

        totalAmount = ticketInformation.reduce(
          (total, ticket, index) => total + ticket.price.sellingPrice * ticketIds[index].quantity,
          totalAmount || 0,
        );
      }

      const updatedField = {
        updatedBy: loggedInUser?.id,
        updatedAt: new Date(),
        product: existingProductInCart,
        totalAmount,
      };

      const updatedCart = await this.CartModel.findOneAndUpdate(
        { _id: cartId },
        updatedField,
        { new: true },
      );

      if (!updatedCart?.product?.length) {
        await this.deleteCart(updatedCart?._id.toString(), loggedInUser);
        return;
      }

      // freeze product quantity

      this.logger.info('[EXTERNAL_API_CART]: Product added to cart', {
        message: updatedCart,
      });

      return updatedCart;
    } catch (error) {
      this.logger.error('[EXTERNAL_API_CART]: FAILED TO ADD ITEM TO CART', {
        err: error instanceof Error ? error.message : String(error),
      });
      exceptionHandling(error);
    }
  }

  async findOneById(id: string): Promise<Cart> {
    try {
      const cart = await this.CartModel.findOne({
        _id: id,
        isDeleted: { $ne: true },
      });

      if (!cart) {
        throw new NotFoundException(ServerErrors.CART.NOT_FOUND);
      }

      return cart;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async deleteCart(cartId: string, loggedInUser?: LoggedInUserInterface) {
    try {
      const updateField = {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: loggedInUser?.id,
      };

      const cart = await updateById<Cart>(this.CartModel, cartId, updateField);

      if (!cart) {
        throw new NotFoundException(ServerErrors.CART.NOT_FOUND);
      }

      this.logger.info('[EXTERNAL_API_CART]: Product removed from cart', {
        message: cart,
      });

      return cart;
    } catch (error) {
      this.logger.error('[EXTERNAL_API_CART]: FAILED TO DELETE ITEM TO CART', {
        err: error instanceof Error ? error.message : String(error),
      });
      exceptionHandling(error);
    }
  }

  async updateCartBeforePayment(
    cartId: string,
    orderId: ObjectId,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      const updatedField = {
        updatedBy: loggedInUser?.id,
        updatedAt: new Date(),
        orderId,
        status: CartStatus.PAYMENT_PENDING,
      };

      const updatedCart = await this.CartModel.findOneAndUpdate(
        { _id: cartId },
        updatedField,
        { new: true },
      );

      this.logger.info('[EXTERNAL_API_CART]: Cart READY FOR PAYMENT', {
        message: updatedCart,
      });

      return updatedCart;
    } catch (error) {
      this.logger.error(
        '[EXTERNAL_API_CART]: FAILED TO UPDATE CART FOR PAYMENT',
        {
          err: error instanceof Error ? error.message : String(error),
        },
      );
      exceptionHandling(error);
    }
  }

  async updateCartPostCheckout(
    cartId: string,
    orderId: ObjectId,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      const updatedField = {
        updatedBy: loggedInUser?.id,
        updatedAt: new Date(),
        orderId,
        status: CartStatus.ORDER_PLACED,
      };

      const updatedCart = await this.CartModel.findOneAndUpdate(
        { _id: cartId },
        updatedField,
        { new: true },
      );

      this.logger.info('[EXTERNAL_API_CART]: Cart ready to checkout', {
        message: updatedCart,
      });

      return updatedCart;
    } catch (error) {
      this.logger.error('[EXTERNAL_API_CART]: FAILED TO ADD ITEM TO CART', {
        err: error instanceof Error ? error.message : String(error),
      });
      exceptionHandling(error);
    }
  }

  async updateCartPostPayment(orderId: string) {
    try {
      const updatedField = {
        updatedAt: new Date(),
        orderId,
        status: CartStatus.ORDER_PLACED,
      };

      const cartId = (await this.findOneByOrderId(orderId))?._id;

      const updatedCart = await this.CartModel.findOneAndUpdate(
        { _id: cartId },
        updatedField,
        { new: true },
      );

      this.logger.info(
        '[EXTERNAL_API_CART]: CART WAS CONVERTED TO ORDER SUCCESSFULLY',
        {
          message: updatedCart,
        },
      );

      return updatedCart;
    } catch (error) {
      this.logger.error(
        '[EXTERNAL_API_CART]: FAILED TO CONVERTED TO ORDER SUCCESSFULLY',
        {
          err: error instanceof Error ? error.message : String(error),
        },
      );
      exceptionHandling(error);
    }
  }

  async findOneByOrderId(orderId: string): Promise<Cart> {
    try {
      const cart = await this.CartModel.findOne({ orderId });

      if (!cart) {
        throw new NotFoundException(ServerErrors.CART.NOT_FOUND);
      }

      return cart;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async deleteItemFromCart(
    cartId: string,
    command: DeleteItemFromCartDto,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      const existingCart = await this.findOneById(cartId);

      if (
        existingCart?.status === CartStatus.TIME_OUT
        || existingCart?.status === CartStatus.ORDER_PLACED
      ) {
        throw new BadRequestException(
          'This cart is no longer available to update',
        );
      }

      const productIndex = existingCart?.product.findIndex(
        product => product.id.toString() === command.productId.toString(),
      );

      if (productIndex === -1) {
        throw new NotFoundException('Product not found in cart');
      }

      // Remove the product from the cart
      existingCart.product.splice(productIndex, 1);

      // Recalculate total amount
      const productIds = existingCart.product.filter(
        op => op.itemType === OrderItemType.PRODUCT,
      );

      const ticketIds = existingCart.product.filter(
        op => op.itemType === OrderItemType.TICKET,
      );

      let totalAmount = 0;

      if (productIds?.length) {
        const productInformation = await Promise.all(
          productIds?.map(product => this.productsService.getProductInformationForCart(product)),
        );

        totalAmount = productInformation.reduce(
          (total, pro, index) => total + pro.price.sellingPrice * productIds[index].quantity,
          0,
        );
      }

      if (ticketIds?.length) {
        const ticketInformation = await Promise.all(
          ticketIds?.map(
            async ticket => await this.queryBus.execute(
              new GetTicketByIdQuery(ticket.id.toString()),
            ),
          ),
        );

        totalAmount = ticketInformation.reduce(
          (total, ticket, index) => total + ticket.price.sellingPrice * ticketIds[index].quantity,
          totalAmount,
        );
      }

      const updatedField = {
        updatedBy: loggedInUser?.id,
        updatedAt: new Date(),
        product: existingCart.product,
        totalAmount,
      };

      const updatedCart = await this.CartModel.findOneAndUpdate(
        { _id: cartId },
        updatedField,
        { new: true },
      );

      if (!updatedCart?.product?.length) {
        await this.deleteCart(updatedCart?._id.toString(), loggedInUser);
        return;
      }

      this.logger.info('[EXTERNAL_API_CART]: Product removed from cart', {
        message: updatedCart,
      });

      return updatedCart;
    } catch (error) {
      this.logger.error(
        '[EXTERNAL_API_CART]: FAILED TO DELETE ITEM FROM CART',
        {
          err: error instanceof Error ? error.message : String(error),
        },
      );
      exceptionHandling(error);
    }
  }

  async addVendorWiseProductsInCart(
    command: AddVendorWiseProductsToCartDto,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      let campId: mongoose.Types.ObjectId | undefined;
      if (command?.campCode) {
        campId = (
          await this.campaignService.findCampaignAndReturn(
            'code',
            command.campCode,
          )
        )?._id;
      }

      await Promise.all(
        command.vendorProducts.flatMap(vendor => vendor.products.map(async p => {
          if (p.itemType === OrderItemType.TICKET) {
            await this.queryBus.execute(new GetTicketByIdQuery(p._id));
          } else {
            await this.productsService.getProductInformationForCart({
              id: p._id,
              quantity: p.quantity,
            });
          }
        })),
      );

      const vendorProducts = command.vendorProducts.map(vendor => ({
        _id: new mongoose.Types.ObjectId(vendor._id),
        products: vendor.products.map(p => ({
          _id: new mongoose.Types.ObjectId(p._id),
          quantity: p.quantity,
          itemType: p.itemType,
        })),
        totalAmount: Math.round(vendor.totalAmount * 100) / 100,
        deliveryFee: Math.round((vendor.deliveryFee || 0) * 100) / 100,
        deliveryMethod: vendor.deliveryMethod,
        deliveryArea: vendor.deliveryArea,
        deliveryPickupLocation: vendor.deliveryPickupLocation,
        houseNo: vendor.houseNo,
        apartment: vendor.apartment,
        city: vendor.city,
        street: vendor.street,
        additionalInfo: vendor.additionalInfo,
        isPricePerProduct: vendor.isPricePerProduct,
      }));

      const totalAmount
        = Math.round(
          vendorProducts.reduce((sum, vendor) => sum + vendor.totalAmount, 0)
            * 100,
        ) / 100;

      const newCart = new this.CartModel({
        vendorProducts,
        product: [], // Explicitly set empty array to prevent inconsistency
        name: command.name,
        email: command.email,
        phone: command.phone,
        address: command.address,
        campId,
        totalAmount,
        createdBy: loggedInUser?.id,
        createdAt: new Date(),
      });

      const cart = await newCart.save();

      this.logger.info(
        `[${command.campCode} - CART]: Vendor-wise products added to cart`,
        {
          message: cart._id,
        },
      );

      return { _id: cart._id };
    } catch (error) {
      this.logger.error(
        `[${command.campCode} - CART]: FAILED TO ADD VENDOR-WISE PRODUCTS TO CART`,
        { err: error instanceof Error ? error.message : String(error) },
      );
      exceptionHandling(error);
    }
  }
}
