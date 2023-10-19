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

export async function findOneById<T>(model: Model<T>, item: string) {
  const filterBy = { _id: item };
  const data = await model.findOne(
    { ...filterBy, delatedAt: { $in: [false, null] } },
  );
  if (!data) {
    return undefined;
  }
  return data;
}

export async function update<T>(model: Model<T>, fieldName: keyof T, item: string, updateField: object) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOneAndUpdate({ ...filterBy, delatedAt: { $in: [false, null] } }, updateField, { new: true });
  if (!data) {
    return undefined;
  }
  return data;
}
export async function updateById<T>(model: Model<T>, item: string, updateField: object) {
  const filterBy = { _id: item };
  const data = await model.findOneAndUpdate(
    { ...filterBy, delatedAt: { $in: [false, null] } },
    { ...updateField, updatedAt: new Date() },
    { new: true },
  );
  if (!data) {
    return undefined;
  }
  return data;
}

export async function findAll<T>(model: Model<T>) {
  const data = await model.find({ isDeleted: { $in: [false, null] } });
  return data;
}

export async function queryhandler<T>(
  model: Model<T>,
  findQuery: {},
  select: string | {},
  page: number,
  limit: number,
  populate: any,
  populate1: any,
) {
  const datas: any = {};
  datas.data = await model
    .find({ ...findQuery, delatedAt: { $in: [false, null] } })
    .select(select)
    .skip(page)
    .limit(limit)
    .populate(populate)
    .populate(populate1);
  datas.totalData = await model.countDocuments(findQuery);
  return datas;
}
