/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Accessibility } from './schema/accessibility.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, createAccessibilityDto, updateAccessibilityDto } from './dto';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { Model } from 'mongoose';

@Injectable()
export class AccessibilityService {
  constructor(
       @InjectModel('Accessibility')
        private readonly AccessibilityModel: Model<Accessibility>,
  ) { }

  async create(dto: createAccessibilityDto, userId: string) {
    const newAccessibility = new this.AccessibilityModel({ ...dto, createdBy: userId });
    return newAccessibility.save();
  }

  async getAll(query:FilterQuery) {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: {};
    let populate1: {};
    if (query.search) {
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }
    populate = {
      path: 'icon',
      select: disSelect,
    };

    select = `${disSelect}`;
    const accessibility = await queryhandler<Accessibility>(
      this.AccessibilityModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return accessibility;
  }

  async getOne(id: string) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const accessibility = await this.AccessibilityModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();
    return accessibility;
  }

  async update(id: string, dto: updateAccessibilityDto, userId: string) {
    const accessibility = await updateById<Accessibility>(this.AccessibilityModel, id, { ...dto, updatedBy: userId });

    if (!accessibility) {
      throw new NotFoundException(ServerErrors.ACCESSIBILITY.NOT_FOUND);
    }
    return accessibility;
  }

  async softDelete(id:string, userId: string) {
    const updateField = {
      isDeleted: true, deleteAt: new Date(), updatedBy: userId, deletedBy: userId,
    };
    const accessibility = await updateById<Accessibility>(
      this.AccessibilityModel,
      id,
      updateField,
    );
    if (!accessibility) {
      throw new NotFoundException(ServerErrors.ACCESSIBILITY.NOT_FOUND);
    }
    return accessibility;
  }

  async findByFieldName(fieldName: keyof Accessibility, items: string): Promise<boolean> {
    const accessibility = await findOneByFieldName<Accessibility>(this.AccessibilityModel, fieldName, items);
    if (accessibility) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof Accessibility, items: string, id:string): Promise<boolean> {
    const accessibility = await findOneByFieldNameExcludeId<Accessibility>(
      this.AccessibilityModel,
      fieldName,
      items,
      id,
    );
    if (accessibility) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
