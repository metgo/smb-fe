import { PartialType } from '@nestjs/mapped-types';
import { createGroupTypeDto } from './creatGroupType.dto';

export class updateGroupTypeDto extends PartialType(createGroupTypeDto) {}
