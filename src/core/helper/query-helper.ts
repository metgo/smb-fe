import { Model } from 'mongoose';

export async function findByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.find({ ...filterBy, delatedAt: { $in: [false, null] } });
  return data;
}

export async function findOneByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({ ...filterBy, delatedAt: { $in: [false, null] } });
  return data;
}

export async function findAll<T>(model: Model<T>) {
  const data = await model.find({ isDeleted: { $in: [false, null] } });
  return data;
}

export async function queryhandler<T>(
  model: Model<T>,
  select: {},
  page: number,
  limit: number,
  populate: string,
  populate1: string,
) {
  const data = await model
    .find({ ...select, delatedAt: { $in: [false, null] } })
    .skip(page)
    .limit(limit)
    .populate(populate)
    .populate(populate1);
  return data;
}
