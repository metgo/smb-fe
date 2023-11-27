/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Voucher } from './schema/voucher.schema';
import {
  FilterQuery, createGuestVoucherDto, createVoucherDto,
} from './dto';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { ConfigService } from 'src/services/config/config.service';
import { queryhandler, updateWhere } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { UpdateFieldInterface } from './interface';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) { }

  async create(
    dto: createVoucherDto | createGuestVoucherDto,
    campaign: mongoose.Types.ObjectId,
    userId: string | null,
  ) {
    let i: number = 0;
    for (i = 0; i < dto.noOfVoucher; i++) {
      const randomCode = generateRandomCode(12);
      const code = dto.campCode + randomCode;
      const newVoucher = new this.VoucherModel({
        ...dto,
        code,
        remainingAmount: `${dto.amount}`,
        campId: campaign._id,
        createdBy: userId,
      });
      newVoucher.save();
    }

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
}
