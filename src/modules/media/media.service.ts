/* eslint-disable no-undef */
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors, defaultMetGoLogoURL } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { DeleteMediaDTO } from 'src/modules/media/dto/delete.dto';
import { UploadDTO } from 'src/modules/media/dto/upload.dto';
import { Media } from 'src/modules/media/schema/media.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class MediaServices {
  constructor(
    @InjectModel('Media')
    private MediaModel: Model<Media>,
    private gcpBucketServices: GcpBucketService,
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

        return {
          image: imageUrl,
          caption: file.originalname,
          alt: file.originalname,
          imageType: file.fieldname,
        };
      }),
    );

    console.log(body);
    console.log(loggedInUser);

    return images;
  }

  async delete(
    loggedInUser: LoggedInUserInterface,
    body: DeleteMediaDTO,
  ): Promise<Business | Product> {
    let deletedImage;
    // delete from business module

    // if (body.imageUrl === defaultMetGoLogoURL) return;
    // if (
    //   body.reference === ReferenceType.BUSINESS
    //   || body.reference === ReferenceType.POI
    //   || body.reference === ReferenceType.EVENT
    // ) {
    //   deletedImage = await this.businessService.deleteImage(
    //     loggedInUser,
    //     body.refId,
    //     body.imageUrl,
    //     body.businessImageType,
    //   );

    //   // delete image in media
    //   await this.MediaModel.deleteOne({
    //     createdBy: loggedInUser.id,
    //     'reference.refId': body.refId,
    //     'reference.schema': body.reference,
    //     url: body.imageUrl,
    //   });
    // }

    // delete image in gcp
    try {
      if (body.imageUrl !== defaultMetGoLogoURL) await this.gcpBucketServices.delete(body.imageUrl);
      return deletedImage;
    } catch (err) {
      if (
        (err?.errors?.length && err?.errors[0]?.reason === 'notFound')
        || err?.message === 'A file name must be specified.'
      ) {
        throw new NotFoundException(ServerErrors.MEDIA.NOT_FOUND);
      }
      exceptionHandling(err);
    }
  }

  async getMediaByName(originalName: string) {
    return await this.MediaModel.findOne({ originalName });
  }
}
