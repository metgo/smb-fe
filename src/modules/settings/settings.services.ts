import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { SettingsDTO } from 'src/modules/settings/dto/settings.dto';
import { UpdateSettingsDto } from 'src/modules/settings/dto/update-settings.dto';
import { Setting } from 'src/modules/settings/schema/settings.schema';

@Injectable()
export class SettingsServices {
  constructor(
    @InjectModel(Setting.name)
    private SettingsModel: Model<Setting>,
  ) {}

  async create(userId: string, body: SettingsDTO) {
    const slug = this.generateSlug(body.title);
    const newSettings = new this.SettingsModel({
      ...body,
      createdBy: userId,
      createdAt: new Date(),
      slug,
    });

    const settings = await newSettings.save();

    return settings;
  }

  async findAll(query: CommonFilterQuery) {
    const { page, limit, search } = query;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};

    if (search) {
      findQuery = {
        title: { $regex: query.search, $options: 'i' },
      };
    }

    const services = await queryhandler<Setting>(this.SettingsModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
    });

    return services;
  }

  async findBySlug(slug: string) {
    const fieldNames = {
      slug,
    };
    const item = await findOneByFieldNames<Setting>(
      this.SettingsModel,
      fieldNames,
    );

    return item;
  }

  private generateSlug(name: string): string {
    return `${name.replace(/ /g, '-').toLowerCase()}`;
  }

  async updateById(
    loggedInUserId: string,
    id: string,
    body: UpdateSettingsDto,
  ) {
    try {
      const updateField = {
        ...body,
        updatedBy: loggedInUserId,
      };
      const updatedSetting = await updateById<Setting>(
        this.SettingsModel,
        id,
        updateField,
      );
      if (!updatedSetting) {
        throw new NotFoundException(`Settings ${ServerErrors.NOT_FOUND}`);
      }
      return updatedSetting;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async softDeleteById(loggedInUserId: string, id: string) {
    try {
      const updateField = {
        deletedBy: loggedInUserId,
        deletedAt: new Date(),
        isDeleted: true,
        updatedBy: loggedInUserId,
      };
      const deletedSetting = await updateById<Setting>(
        this.SettingsModel,
        id,
        updateField,
      );
      if (!deletedSetting) {
        throw new NotFoundException(`Settings ${ServerErrors.NOT_FOUND}`);
      }
      return deletedSetting;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
