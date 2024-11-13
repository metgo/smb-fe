import { PartialType } from '@nestjs/mapped-types';
import { CreateProductByAdmin } from './create-product-by-admin.dto';

export class UpdateProductByAdminDto extends PartialType(
  CreateProductByAdmin,
) {}
