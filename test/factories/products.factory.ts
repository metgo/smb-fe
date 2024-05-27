import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { BaseFactory } from 'test/factories/base.factory';
import { Product, ProductSchema } from 'src/modules/products/schema/products.schema';
import { ProductStatus } from 'src/modules/products/products.type';

const ProductModel = mongoose.model(Product.name, ProductSchema);
export class ProductFactory implements BaseFactory<Product> {
  static new() {
    return new ProductFactory();
  }

  async create(product: Partial<Product> = {}): Promise<any> {
    const defaultProduct = {
      name: faker.person.firstName(),
      busiEmail: faker.internet.email(),
      status: ProductStatus.ACTIVE,
      primaryUserId: new mongoose.Types.ObjectId(),
      businessId: new mongoose.Types.ObjectId(),
      dmoId: new mongoose.Types.ObjectId(),
    };
    const newProduct = await ProductModel.create({
      ...defaultProduct,
      ...product,
    });
    return newProduct;
  }

  async createMany(times: number, product: Partial<Product> = {}) {
    return await Promise.all(range(times).map(() => this.create(product)));
  }
}
