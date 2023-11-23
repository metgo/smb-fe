import { PartialType } from '@nestjs/mapped-types';
import { createVoucherTemplateDto } from './createVoucherTemplate.dto';

export class updateVoucherTemplateDto extends PartialType(createVoucherTemplateDto) { }
