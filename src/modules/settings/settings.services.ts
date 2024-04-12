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
    const slug = this.generateSlug(body.title);
    const newSettings = new this.SettingsModel({
      ...body,
      createdBy: userId,
      slug,
    });

    const settings = await newSettings.save();

    return settings;
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
}
