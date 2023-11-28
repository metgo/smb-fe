/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Voucher } from './schema/voucher.schema';
import {
  FilterQuery, createVoucherDto,
} from './dto';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { queryhandler, updateWhere } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { UpdateFieldInterface } from './interface';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
  ) { }

  async create(
    dto: createVoucherDto,
    userId: string | null,
    campaignId?: mongoose.Types.ObjectId,
  ) {
    let i: number = 0;
    let vouchers = [];

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

      vouchers.push(newVoucher.save());
    }

    await Promise.all(vouchers);

    return 'success';
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

  async getMy(userId: string, query: FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number = 1;
    let limit: number = 10;
    let populate: any;
    let populate1: {};

    findQuery = {
      createdBy: userId,
    };
    if (query.search) {
      findQuery = {
        ...findQuery,
        ...query,
        name: { $regex: query.search, $options: 'i' },
      };
      delete findQuery?.search;
    } else {
      findQuery = {
        ...findQuery,
        ...query,
      };
    }
    delete findQuery?.page;
    delete findQuery?.limit;
    select = disSelect;
    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return voucher;
  }

  async getMyAssign(userId: string, query:FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number = 1;
    let limit: number = 10;
    let populate: any;
    let populate1: {};

    findQuery = {
      assignedTo: userId,
    };
    if (query.search) {
      findQuery = {
        ...findQuery,
        ...query,
        name: { $regex: query.search, $options: 'i' },
      };
      delete findQuery?.search;
    } else {
      findQuery = {
        ...findQuery,
        ...query,
      };
    }
    delete findQuery?.page;
    delete findQuery?.limit;
    delete findQuery?.status;
    select = disSelect;
    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      findQuery,
      select,
      page,
      limit,
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

  async findByIds(ids: string[]): Promise<Voucher[]> {
    const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } });

    return voucherIds;
  }

  async updateVoucherAmount(loggedInUserId: string, voucherId: string, totalAmount: number) {
    const voucher = await this.getOneById(voucherId);

    const remainingAmount = Math.max(0, voucher.remainingAmount - totalAmount);
    const amountToBeRedeemed = Math.max(0, totalAmount - voucher.remainingAmount);

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
