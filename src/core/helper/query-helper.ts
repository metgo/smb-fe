import mongoose, { FilterQuery, Model } from 'mongoose';
import { Locale } from 'src/common/enum';
import { QueryHelperInterface } from 'src/core/helper/query-helper.interface';

export async function findByFieldName<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: string,
) {
  const filterBy = { [fieldName]: item };
  const data = await model.find({ ...filterBy, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByFieldNames<T>(
  model: Model<T>,
  fieldNames: object,
) {
  const data = await model.findOne({
    ...fieldNames,
    deletedAt: { $in: [null] },
  });
  return data;
}

export async function findOneByIDPopulate<T>(
  model: Model<T>,
  fieldNames: object,
  populate: any,
) {
  const data = await model.findOne({
    ...fieldNames,
    deletedAt: { $in: [null] },
  }).populate(populate);
  return data;
}

export async function findOneByOrCase<T>(model: Model<T>, fieldNames: object) {
  const data = await model.findOne({
    ...fieldNames,
    deletedAt: { $in: [null] },
  });
  return data;
}

export async function findOneByFieldName<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: string,
) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({ ...filterBy, deletedAt: { $in: [null] } });
  return data;
}

export async function findOneByFieldNameIncludingDeleted<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: string,
) {
  const filterBy: FilterQuery<T> = { [fieldName]: item } as FilterQuery<T>; // Type assertion
  const data = await model.findOne(filterBy);
  return data;
}

export async function findOneByFieldNameExcludeId<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: string,
  id: string,
) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOne({
    ...filterBy,
    deletedAt: { $in: [null] },
    _id: { $nin: [id] },
  });
  return data;
}

export async function findOneById<T>(model: Model<T>, item: string) {
  const filterBy = { _id: item };
  const data = await model.findOne({ ...filterBy, deletedAt: { $in: [null] } });

  return data;
}

export async function update<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: string,
  updateField: object,
) {
  const filterBy = { [fieldName]: item };
  const data = await model.findOneAndUpdate(
    { ...filterBy, deletedAt: { $in: [null] } },
    updateField,
    { new: true },
  );
  if (!data) {
    return undefined;
  }
  return data;
}

export async function updateManyByIds<T>(
  model: Model<T>,
  fieldName: keyof T,
  item: mongoose.Types.ObjectId[],
  updateField: object,
) {
  const filterBy = { [fieldName]: { $in: item } };
  const data = await model.updateMany(
    { ...filterBy, deletedAt: { $in: [null] } },
    updateField,
    { new: true },
  );
  if (!data) {
    return undefined;
  }
  return data;
}

export async function updateById<T>(
  model: Model<T>,
  item: string | mongoose.Types.ObjectId,
  updateField: object,
) {
  const filterBy = { _id: item };
  const data = await model.findOneAndUpdate(
    { ...filterBy, deletedAt: { $in: [null] } },
    { ...updateField, updatedAt: new Date() },
    { new: true },
  );

  return data;
}

export async function updateOneByManyFields<T>(
  model: Model<T>,
  filterFields: object,
  updateField: object,
) {
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

export async function updateManyByManyFields<T>(
  model: Model<T>,
  filterFields: object,
  updateField: object,
) {
  const filterBy = { ...filterFields };

  const data = await model.updateMany(
    filterBy,
    {
      ...updateField,
      updatedAt: new Date(),
    },
    { new: true },
  );
  return data;
}

export async function findManyByFilter<T>(model: Model<T>, filter: object) {
  const updatedDocuments = await model.find(filter).lean();
  return updatedDocuments;
}

export async function deleteItem<T>(
  model: Model<T>,
  filterFields: object,
  updateField: object,
) {
  const data = await model.findOneAndUpdate(
    filterFields,
    {
      ...updateField,
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true },
  );
  return data;
}

export async function queryhandler<T>(
  model: Model<T>,
  queries: QueryHelperInterface,
) {
  const {
    findQuery,
    select,
    page,
    limit,
    sort,
    populate,
    populate1,
    languageQuery,
  } = queries;

  const datas: any = {};
  datas.data = await model
    .find({ ...findQuery, deletedAt: { $in: [null] } })
    .select(select)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ [sort]: -1 })
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
  if (page && limit) {
    const meta = {
      page,
      limit,
      data: datas.data.length,
      pageCount: Math.ceil(datas.totalData / limit),
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(datas.totalData / limit),
    };
    datas.meta = meta;
  }

  return datas;
}
