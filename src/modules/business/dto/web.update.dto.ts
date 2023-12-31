import { PartialType } from '@nestjs/swagger';
import { WebCreateBusiness } from './web-create-business.dto';

export class updateWebBusinessDto extends PartialType(WebCreateBusiness) {}
