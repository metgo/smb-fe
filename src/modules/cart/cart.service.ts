import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
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

@Injectable()
export class CartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
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

      let campId;
      if (command?.campCode) {
        campId = (
          await this.campaignService.findCampaignAndReturn(
            'code',
            command?.campCode,
          )
        )?._id;
      }

      const productInformation
        = await this.productsService.getProductInformationForCart(
          command.product,
        );

      const totalAmount
        = productInformation?.price?.sellingPrice * command.product.quantity;

      const newCart = new this.CartModel({
        product: command?.product,
        createdBy: loggedInUser?.id,
        createdAt: new Date(),
        totalAmount,
        campId,
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
          err: error.message,
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
        existingProductInCart[productIndex].houseNo = command?.houseNo;
        existingProductInCart[productIndex].apartment = command?.apartment;
        existingProductInCart[productIndex].city = command?.city;
        existingProductInCart[productIndex].street = command?.street;
        existingProductInCart[productIndex].isGift = command?.isGift;
        existingProductInCart[productIndex].additionalInfo
          = command?.additionalInfo;
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
          deliveryMethod: command?.deliveryMethod,
          deliveryArea: command?.deliveryArea,
          deliveryPickupLocation: command?.deliveryPickupLocation,
          houseNo: command?.houseNo,
          city: command?.city,
          street: command?.street,
          isGift: command?.isGift,
          apartment: command?.apartment,
          additionalInfo: command?.additionalInfo,
        });
      }

      existingProductInCart = existingProductInCart.filter(
        product => product.quantity > 0,
      );

      const productInformation = await Promise.all(
        existingProductInCart?.map(product => this.productsService.getProductInformationForCart(product)),
      );

      const totalAmount = productInformation.reduce(
        (total, pro, index) => total
          + pro.price.sellingPrice * existingProductInCart[index].quantity,
        0,
      );

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
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async findOneById(id: string): Promise<Cart> {
    try {
      const cart = await this.CartModel.findOne({ _id: id, isDeleted: false });

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
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async findOneByIdAndPopulate(id: string) {
    try {
      const cart = await this.CartModel.findById(id);

      if (!cart) {
        throw new NotFoundException(ServerErrors.CART.NOT_FOUND);
      }

      return cart;
    } catch (err) {
      exceptionHandling(err);
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
        err: error.message,
      });
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
}
