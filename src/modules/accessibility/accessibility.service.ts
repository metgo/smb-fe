/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Locale } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import { Accessibility } from './schema/accessibility.schema';
import { createAccessibilityDto, updateAccessibilityDto } from './dto';
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
  ) {}

  async create(dto: createAccessibilityDto, userId: string) {
    const newAccessibility = new this.AccessibilityModel({ ...dto, createdBy: userId });
    return newAccessibility.save();
  }

  async getAll(queries: LocaleFilterQuery) {
    const {
      page, limit, search, locale, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.MAX_ASPECT_LIMIT;
    const select = `${disSelect}`;

    let findQuery: {} = query;
    let populate1: {};

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }
    const populate = {
      path: 'icon',
      select: disSelect,
    };

    const accessibility = await queryhandler<Accessibility>(
      this.AccessibilityModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
        languageQuery: locale,
      },
    );

    return accessibility;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const accessibility = await this.AccessibilityModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (locale === Locale.HEBREW) {
      accessibility.name = accessibility?.hebrewName || accessibility.name;
    }
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
