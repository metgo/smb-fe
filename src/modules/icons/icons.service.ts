import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';
import { findOneByFieldName, queryhandler, updateById } from 'src/core/helper/query-helper';
import {
  CreateIconDto, UpdateIconDto,
} from './dto';
import { Icons } from './schema/icon.schema';

@Injectable()
export class IconsService {
  constructor(
        @InjectModel('Icons') private IconModel: Model<Icons>,
  ) { }

  // icons actions
  async createIcon(dto: CreateIconDto) {
    const iconAlt = dto.name.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '_');
    const newIconCategory = new this.IconModel({ ...dto, iconAlt });
    return newIconCategory.save();
  }

  async getIcons() {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const iconList = await queryhandler<Icons>(
      this.IconModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return iconList;
  }

  async getIcon(id: string) {
    const select = `${disSelect}`;
    const iconCategory = await this.IconModel.findById(id).select(select);
    return iconCategory;
  }

  async updateIcon(id: string, dto: UpdateIconDto) {
    const iconCategory = await updateById<Icons>(this.IconModel, id, dto);

    if (!iconCategory) {
      throw new NotFoundException(ServerErrors.ICON_NOT_FOUND);
    }
    return iconCategory;
  }

  async softDeleteIcon(id:string) {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const iconCategory = await updateById<Icons>(
      this.IconModel,
      id,
      updateField,
    );
    if (!iconCategory) {
      throw new NotFoundException(ServerErrors.ICON_NOT_FOUND);
    }
    return iconCategory;
  }

  // find icon by field name

  async findByFieldName(fieldName: keyof Icons, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Icons>(this.IconModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
