import { Image } from 'src/common/interface/image.interface';
import { ProductDto } from 'src/modules/products/dto/product.dto';

/* eslint-disable no-shadow */
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface IProductQuery{
    page?: number,
    limit?: number,
    businessId?: string;
}

export interface FindProducts {
    query: IProductQuery,
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
