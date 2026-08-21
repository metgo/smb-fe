import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { Partner, PartnerDocument } from './schema/partners.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PartnersService {
  constructor(
    @InjectModel(Partner.name)
    private readonly partnerModel: Model<PartnerDocument>,
  ) {}

  async getAll(
    websiteId: string,
    locale: Locale = Locale.HEBREW,
  ): Promise<
    {
      name: string;
      description: string;
      _id: mongoose.Types.ObjectId;
      logo: string;
      siteUrl: string;
    }[]
  > {
    const partners = await this.partnerModel
      .find({
        websites: new mongoose.Types.ObjectId(websiteId),
        isDeleted: { $ne: true },
      })
      .select(
        '_id nameEn nameHe nameAr descriptionEn descriptionHe descriptionAr isActive logo siteUrl websites',
      )
      .lean();

    return partners.map(p => {
      let name: string;
      let description: string;

      if (locale === Locale.HEBREW) {
        name = p.nameHe || p.nameEn || p.nameAr;
        description = p.descriptionHe || p.descriptionEn || p.descriptionAr;
      } else if (locale === Locale.ARABIC) {
        name = p.nameAr || p.nameEn || p.nameHe;
        description = p.descriptionAr || p.descriptionEn || p.descriptionHe;
      } else {
        name = p.nameEn || p.nameHe || p.nameAr;
        description = p.descriptionEn || p.descriptionHe || p.descriptionAr;
      }

      return {
        _id: p._id,
        name,
        description,
        isActive: p.isActive,
        logo: p.logo,
        siteUrl: p.siteUrl,
      };
    });
  }
}
