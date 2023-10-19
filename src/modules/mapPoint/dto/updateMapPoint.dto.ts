import { PartialType } from '@nestjs/mapped-types';
import {
  createMapPointDto,
} from './createMapPoint.dto';

export class updateMapPointDto extends PartialType(createMapPointDto) { }
