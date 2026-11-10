import { paginationConfig } from 'src/common/pagination.config';

export const paginateData = (pages: number, limits: number, list: any[]) => {
  if (!pages && !limits) {
    const datas = {
      data: list,
      totalData: list.length,
    };

    return datas;
  }
  const page = Number(pages) || paginationConfig.page;
  const limit = Number(limits) || paginationConfig.limit;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const totalData = list.length;
  const pageCount = Math.ceil(totalData / limit);

  const data = list.slice(startIndex, endIndex);

  const datas = {
    data,
    totalData,
    meta: {
      page,
      limit,
      data: data.length,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  };

  return datas;
};
