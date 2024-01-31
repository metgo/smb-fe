import mongoose, { Model } from 'mongoose';
import { Locale } from 'src/common/enum';

export async function findByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.find({ ...filterBy, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByFieldNames<T>(model: Model<T>, fieldNames: object) {
  const data = await model.findOne({ ...fieldNames, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByOrCase<T>(model: Model<T>, fieldNames: object) {
  const data = await model.findOne({ ...fieldNames, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByFieldName<T>(model: Model<T>, fieldName: keyof T, item: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({ ...filterBy, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByFieldNameExcludeId<T>(model: Model<T>, fieldName: keyof T, item: string, id: string) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({ ...filterBy, deletedAt: { $in: [null] }, _id: { $nin: [id] } });
  return data;
}

export async function findOneById<T>(model: Model<T>, item: string) {
  const filterBy = { _id: item };
  const data = await model.findOne(
    { ...filterBy, deletedAt: { $in: [null] } },
  );

  return data;
}

export async function update<T>(model: Model<T>, fieldName: keyof T, item: string, updateField: object) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOneAndUpdate({ ...filterBy, deletedAt: { $in: [null] } }, updateField, { new: true });
  if (!data) {
    return undefined;
  }
  return data;
}

export async function updateMany<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: mongoose.Types.ObjectId[],
  updateField: object,
) {
  const filterBy = { [fieldName]: { $in: item } };
  const data = await model.updateMany({ ...filterBy, deletedAt: { $in: [null] } }, updateField, { new: true });
  if (!data) {
    return undefined;
  }
  return data;
}

export async function updateById<T>(model: Model<T>, item: string | mongoose.Types.ObjectId, updateField: object) {
  const filterBy = { _id: item };
  const data = await model.findOneAndUpdate(
    { ...filterBy, deletedAt: { $in: [null] } },
    { ...updateField, updatedAt: new Date() },
    { new: true },
  );

  return data;
}

export async function updateWhere<T>(model: Model<T>, filterFields: object, updateField: object) {
  const filterBy = { ...filterFields, deletedAt: { $in: [null] } };

  const data = await model.findOneAndUpdate(
    filterBy,
    {
      ...updateField,
      updatedAt: new Date(),
    },
    { new: true },
  );
  return data;
}

export async function findAll<T>(model: Model<T>) {
  const data = await model.find({ isDeleted: { $in: [null] } });
  return data;
}

export async function queryhandler<T>(
  model: Model<T>,
  findQuery: {},
  select: string | {},
  page: number,
  limit: number,
  populate?: any,
  populate1?: any,
  languageQuery ?: Locale,
) {
  const datas: any = {};
  datas.data = await model
    .find({ ...findQuery, deletedAt: { $in: [null] } })
    .select(select)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(populate)
    .populate(populate1);

  if (languageQuery && languageQuery === Locale.HEBREW) {
    datas.data.map(data => {
      // eslint-disable-next-line no-param-reassign
      data.name = data?.hebrewName || data.name;
      return { ...data };
    });
  }
  datas.totalData = await model.countDocuments(findQuery);
  const meta = {
    page,
    limit,
    data: datas.data.length,
    pageCount: Math.ceil(datas.totalData / limit),
    hasPreviousPage: page > 1,
    hasNextPage: page < Math.ceil(datas.totalData / limit),
  };
  datas.meta = meta;
  return datas;
}
