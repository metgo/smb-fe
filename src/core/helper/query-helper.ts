import { Model } from 'mongoose';

export async function findByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.find({ ...filterBy, delatedAt: [false, null] });
  console.log(data);
  return data;
}

export async function findOneByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({ ...filterBy, delatedAt: { $in: [false, null] } });
  return data;
}

export async function findAll<T>(model: Model<T>) {
  const data = await model.find({ delatedAt: { $in: [false, null] } });
  return data;
}
