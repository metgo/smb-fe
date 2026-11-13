type TCatalogueItem = IPunchPassPayload["catalogues"][number];

// Item types that are scheduled and therefore carry a date & time
const DATE_TIME_TYPES: TPunchPassType[] = ["CLASS", "EVENT"];

export const hasDateTimeField = (type?: TPunchPassType) =>
  !!type && DATE_TIME_TYPES.includes(type);

// Drop `dateTime` when it is empty or doesn't apply to the item's type
export const toCataloguePayload = (items: TCatalogueItem[] = []) =>
  items.map(({ dateTime, ...item }) =>
    dateTime && hasDateTimeField(item.type) ? { ...item, dateTime } : item,
  );
