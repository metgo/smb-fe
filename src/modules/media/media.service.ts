/* eslint-disable no-undef */
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/services/business.service';
import { Business } from 'src/modules/business/schema/business.schema';
import { DeleteMediaDTO } from 'src/modules/media/dto/delete.dto';
import { UploadDTO } from 'src/modules/media/dto/upload.dto';
import { ReferenceType } from 'src/modules/media/media.type';
import { Media } from 'src/modules/media/schema/media.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { Product } from 'src/modules/products/schema/products.schema';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class MediaServices {
  constructor(
    @InjectModel('Media')
    private MediaModel: Model<Media>,
    @Inject(forwardRef(() => BusinessService))
    private businessService: BusinessService,
    private gcpBucketServices: GcpBucketService,
    private productService: ProductsService,
  ) {}

  async create(
    loggedInUser: LoggedInUserInterface,
    files: Array<Express.Multer.File>,
    body: UploadDTO,
  ) {
    const images = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        // store in gcp
        const imageUrl = await this.gcpBucketServices.upload(file);

        if (body.reference === ReferenceType.BUSINESS) {
          // store in media database
          const newMedia = new this.MediaModel({
            reference: {
              refId: body.refId,
              schema: body.reference,
            },
            createdBy: loggedInUser.id,
            url: imageUrl,
            originalName: file.originalname,
            mimetype: file.mimetype,
          });
          await newMedia.save();
        }

        return {
          image: imageUrl,
          caption: file.originalname,
          alt: file.originalname,
        };
      }),
    );

    // update to business model
    if (body.reference === ReferenceType.BUSINESS) {
      const updateBusiness = await this.businessService.uploadMedia(
        body.refId,
        loggedInUser.id,
        images,
        loggedInUser.role,
      );
      return updateBusiness;
    }

    if (body.reference === ReferenceType.EVENT) {
      const updateBusiness = await this.businessService.uploadMedia(
        body.refId,
        loggedInUser.id,
        images,
        loggedInUser.role,
      );
      return updateBusiness;
    }

    // update to product model
    if (body.reference === ReferenceType.PRODUCT) {
      const updateProduct = await this.productService.uploadMedia({
        productId: body.refId,
        businessId: body.businessId,
        loggedInUserId: loggedInUser.id,
        body: images,
        role: loggedInUser.role,
      });
      return updateProduct;
    }

    return images;
  }

  async delete(
    loggedInUser: LoggedInUserInterface,
    body: DeleteMediaDTO,
  ): Promise<Business | Product> {
    let deletedImage;
    // delete from business module
    if (body.reference === ReferenceType.BUSINESS) {
      deletedImage = await this.businessService.deleteImage(
        loggedInUser,
        body.refId,
        body.imageUrl,
      );

      // delete image in media
      await this.MediaModel.deleteOne({
        createdBy: loggedInUser.id,
        'reference.refId': body.refId,
        'reference.schema': body.reference,
        url: body.imageUrl,
      });
    }

    if (body.reference === ReferenceType.EVENT) {
      deletedImage = await this.businessService.deleteImage(
        loggedInUser,
        body.refId,
        body.imageUrl,
      );

      // delete image in media
      await this.MediaModel.deleteOne({
        createdBy: loggedInUser.id,
        'reference.refId': body.refId,
        'reference.schema': body.reference,
        url: body.imageUrl,
      });
    }

    // delete from product module
    if (body.reference === ReferenceType.PRODUCT) {
      deletedImage = await this.productService.deleteImage(
        loggedInUser.id,
        body.refId,
        body.imageUrl,
      );
    }

    // delete image in gcp
    try {
      await this.gcpBucketServices.delete(body.imageUrl);
      return deletedImage;
    } catch (err) {
      if (err?.errors[0]?.reason === 'notFound') {
        throw new NotFoundException(ServerErrors.MEDIA.NOT_FOUND);
      }
      exceptionHandling(err);
    }
  }

  async getMediaByName(originalName: string) {
    return await this.MediaModel.findOne({ originalName });
  }
}
