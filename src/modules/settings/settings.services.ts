import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { findOneByFieldNames } from 'src/core/helper/query-helper';
import { SettingsDTO } from 'src/modules/settings/dto/settings.dto';
import { Setting } from 'src/modules/settings/schema/settings.schema';

@Injectable()
export class SettingsServices {
  constructor(
    @InjectModel(Setting.name)
    private SettingsModel: Model<Setting>,
  ) {}

  async create(userId: string, body: SettingsDTO) {
    const newSettings = new this.SettingsModel({
      ...body,
      createdBy: userId,
    });

    const settings = await newSettings.save();

    return settings;
  }

  async findByTitle(title: string) {
    const fieldNames = {
      title,
    };
    const item = await findOneByFieldNames<Setting>(
      this.SettingsModel,
      fieldNames,
    );

    return item;
  }
}
