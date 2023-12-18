/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
import {
  BadRequestException, Inject, Injectable, NotFoundException, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { paginationConfig } from 'src/common/pagination.config';
import { Voucher } from './schema/voucher.schema';
import {
  FilterQuery, createVoucherDto,
} from './dto';
import { Currency } from 'src/common/enum';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import { queryhandler, updateMany, updateWhere } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { UpdateFieldInterface } from './interface';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) { }

  async create(
    dto: createVoucherDto,
    userId: string | null,
    campaignId?: mongoose.Types.ObjectId,
  ) {
    let i: number = 0;
    const voucherId: any = [];
    const totalAmount = dto.noOfVoucher * dto.amount;
    for (i = 0; i < dto.noOfVoucher; i++) {
      const randomCode = generateRandomCode(12);
      const code = dto?.campCode ? dto.campCode + randomCode : `TAV8${randomCode}`;
      const newVoucher = new this.VoucherModel({
        ...dto,
        code,
        remainingAmount: dto.amount,
        campId: campaignId || null,
        createdBy: userId,
      });
      newVoucher.save();
      voucherId.push(newVoucher._id);
    }

    const paymentLink = await this.paymentService.generateLink(totalAmount, Currency.ILS, PaymentPurpose.VOUCHER, voucherId);
    return paymentLink;
  }

  async getOne(code: string) {
    const select = disSelect;
    const voucher = await this.VoucherModel.findOne({ code }).select(select).exec();
    if (!voucher) {
      throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
    }
    return voucher;
  }

  async getOneById(id: string) {
    const select = disSelect;
    const voucher = await this.VoucherModel.findById(id).select(select).exec();
    if (!voucher) {
      throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
    }
    return voucher;
  }

  async getMy(userId: string, queries: FilterQuery, assignedToMe?: boolean) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;
    let findQuery: any = { ...query, createdBy: userId };
    let populate: any;
    let populate1: {};

    if (assignedToMe) {
      findQuery = {
        ...findQuery,
        assignedTo: new mongoose.Types.ObjectId(userId),
      };
      delete findQuery?.createdBy;
      delete findQuery?.status;
    }

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return voucher;
  }

  async assignUser(code: string, updateField: UpdateFieldInterface) {
    const filterQuery = {
      code,
      assignedTo: null,
    };
    const assignUser = await updateWhere<Voucher>(this.VoucherModel, filterQuery, updateField);

    if (!assignUser) {
      throw new NotFoundException(ServerErrors.VOUCHER.NOT_FOUND);
    }
    return assignUser;
  }

  async update(id: mongoose.Types.ObjectId[], updateField: object) {
    const updateVoucher = await updateMany<Voucher>(
      this.VoucherModel,
      '_id',
      id,
      updateField,
    );

    if (!updateVoucher) {
      throw new BadRequestException('voucher not found');
    }
  }

  async findByIds(ids: string[]): Promise<Voucher[]> {
    const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } });

    return voucherIds;
  }

  async updateVoucherAmount(loggedInUserId: string | null, voucherId: string, totalAmount: number) {
    const voucher = await this.getOneById(voucherId);

    const remainingAmount = remainingAmountCalculation(voucher.remainingAmount, totalAmount);
    const amountToBeRedeemed = remainingAmountCalculation(totalAmount, voucher.remainingAmount);

    const updatedVoucher = await this.VoucherModel.findOneAndUpdate(
      { _id: voucherId },
      {
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
        remainingAmount,
      },
      { new: true },
    );

    if (!updatedVoucher) {
      throw new NotFoundException(ServerErrors.VOUCHER.NOT_FOUND);
    }

    return {
      amountToBeRedeemed,
      redeemedAmount: totalAmount - amountToBeRedeemed,
    };
  }
}
