import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/common/enum';

export class MiniSite {
  constructor(data?: Partial<MiniSite>) {
    this.title = data?.title ?? '';
    this.subTitle = data?.subTitle ?? '';
    this.greeting = data?.greeting ?? '';
    this.deliveryAddress = data?.deliveryAddress ?? '';
    this.isDeliveredToHome = data?.isDeliveredToHome ?? false;
    this.logoPath = data?.logoPath ?? '';
  }

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    title: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    subTitle: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    greeting: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    deliveryAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isDeliveredToHome: boolean;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    logoPath: string;
}

export class CompanyInfo {
  constructor(data?: Partial<CompanyInfo>) {
    this.name = data?.name ?? '';
    this.contactPerson = data?.contactPerson ?? '';
    this.countryCode = data?.countryCode ?? '';
    this.phoneNumber = data?.phoneNumber ?? '';
    this.email = data?.email ?? '';
  }

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    name: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    contactPerson: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    countryCode: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    phoneNumber: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    email: string;
}

export class VoucherInfo {
  constructor(data?: Partial<CompanyInfo>) {
    this.name = data?.name ?? '';
    this.email = data?.email ?? '';
    this.countryCode = data?.countryCode ?? '';
    this.phoneNumber = data?.phoneNumber ?? '';
  }

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    name: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    email: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    countryCode: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    phoneNumber: string;
}

export class Product {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    _id: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    name: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
    description: string;

  @ApiProperty()
  @IsOptional()
    images: any[];

  @ApiProperty()
  @IsOptional()
    price: any;

  @ApiProperty()
  @IsOptional()
    businessId: any;
}

export class GetProductsByCampaignResponse {
  constructor(products: any[], camp: any, voucher?: any, locale?: string) {
    this._id = camp?._id?.toString();

    this.products = (products || []).map(product => {
      let localizedName = product.name;
      let localizedDescription = product.description;

      if (locale === Locale.HEBREW) {
        localizedName = product.nameHe || product.name || product.nameAr;

        localizedDescription
          = product.descriptionHe || product.description || product.descriptionAr;
      }

      if (locale === Locale.ARABIC) {
        localizedName = product.nameAr || product.name || product.nameHe;

        localizedDescription
          = product.descriptionAr || product.description || product.descriptionHe;
      }

      let localizedBusiness = product.businessId;

      if (product.businessId) {
        let localizedBusinessName = product.businessId.name;

        if (locale === Locale.HEBREW) {
          localizedBusinessName
            = product.businessId.nameHe
            || product.businessId.name
            || product.businessId.nameAr;
        }

        if (locale === Locale.ARABIC) {
          localizedBusinessName
            = product.businessId.nameAr
            || product.businessId.name
            || product.businessId.nameHe;
        }

        const { nameHe, nameAr, ...businessData } = product.businessId.toObject
          ? product.businessId.toObject()
          : product.businessId;

        localizedBusiness = {
          ...businessData,
          name: localizedBusinessName,
        };
      }

      const {
        nameHe, nameAr, descriptionHe, descriptionAr, ...productData
      }
        = product.toObject ? product.toObject() : product;

      return {
        ...productData,
        name: localizedName,
        description: localizedDescription,
        businessId: localizedBusiness,
        images: (product.images || []).map(
          ({ subCoordinates, ...img }: any) => img,
        ),
      };
    });

    this.miniSite = new MiniSite({
      title: camp?.miniSite?.title,
      subTitle: camp?.miniSite?.subTitle,
      greeting: camp?.miniSite?.greeting,
      deliveryAddress: camp?.miniSite?.deliveryAddress,
      isDeliveredToHome: camp?.miniSite?.isDeliveredToHome,
      logoPath: camp?.logoPath,
    });

    this.companyInfo = new CompanyInfo(camp?.companyInfo);

    if (voucher) {
      this.voucher = new VoucherInfo({
        name: voucher?.assigneeInfo?.name,
        email: voucher?.assigneeInfo?.email,
        countryCode: voucher?.assigneeInfo?.countryCode,
        phoneNumber: voucher?.assigneeInfo?.phone,
      });
    }
  }

  @ApiProperty({ type: String })
    _id: string;

  @ApiProperty({ required: true, type: [Product] })
    products: Product[];

  @ApiProperty({ required: true, type: MiniSite })
    miniSite: MiniSite;

  @ApiProperty({ required: true, type: CompanyInfo })
    companyInfo: CompanyInfo;

  @ApiProperty({ required: false, type: VoucherInfo })
    voucher: VoucherInfo;
}
