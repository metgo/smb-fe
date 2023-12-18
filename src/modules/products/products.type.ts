import { Image } from 'src/common/interface/image.interface';
import { ProductDto } from 'src/modules/products/dto/product.dto';
import { FilterQuery } from 'src/modules/products/dto/query.dto';

/* eslint-disable no-shadow */
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface FindProductsQuery {
    query: FilterQuery,
    myProduct?: boolean,
    collaboratedProducts?: boolean,
    loggedInUser?: string,
}

export interface updateCommand {
    productId: string,
    businessId: string,
    loggedInUserId: string,
    body: ProductDto | Image[],
}
