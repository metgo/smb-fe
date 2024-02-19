export const paginateData = (page: number, limit: number, list: any[]) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const totalData = list.length;
  const pageCount = Math.ceil(totalData / limit);

  const data = list.slice(startIndex, endIndex);

  return {
    data,
    page,
    limit,
    totalData,
    pageCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
};
