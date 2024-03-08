import { PartialType } from '@nestjs/mapped-types';
import { createSocialMediaDto } from './createSocialMedia.dto';

export class updateSocialMediaDto extends PartialType(createSocialMediaDto) {}
