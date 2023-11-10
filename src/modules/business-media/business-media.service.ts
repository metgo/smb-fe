/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Media } from 'src/modules/business-media/schema/media.schema';
import { BusinessService } from 'src/modules/business/business.service';
import { Business } from 'src/modules/business/schema/business.schema';
import { DeleteMediaDTO } from 'src/modules/business-media/dto/delete.dto';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class BusinessMediaServices {
  constructor(
      @InjectModel('Media')
      private MediaModel: Model<Media>,
      private gcpBucketServices: GcpBucketService,
      private businessService: BusinessService,
  ) { }

  async create(businessId: string, userId:string, files: Array<Express.Multer.File>) {
    const images = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        // store in gcp
        const imageUrl = await this.gcpBucketServices.upload(file);

        // store in media database
        const newMedia = new this.MediaModel({
          reference: {
            refId: businessId,
            schema: Business.name,
          },
          createdBy: userId,
          url: imageUrl,
          originalName: file.originalname,
          mimetype: file.mimetype,
        });

        await newMedia.save();

        return {
          image: imageUrl,
          caption: file.originalname,
          alt: file.originalname,
        };
      }),
    );

    // update in business module
    const updateBusiness = await this.businessService.updateBusiness(businessId, images);
    return updateBusiness;
  }

  async delete(userId:string, businessId:string, body: DeleteMediaDTO): Promise<Business> {
    // delete image in business
    const deleteImageinBusiness = await this.businessService.deleteImage(businessId, body.imageUrl);

    // delete image in media

    await this.MediaModel.deleteOne({
      createdBy: userId,
      'reference.refId': businessId,
      'reference.schema': Business.name,
      url: body.imageUrl,
    });

    // delete image in gcp
    await this.gcpBucketServices.delete(body.imageUrl);

    return deleteImageinBusiness;
  }
}
