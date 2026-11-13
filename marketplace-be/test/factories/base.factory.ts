export interface BaseFactory<T> {
  create: (entity: Partial<T>) => Promise<T>;
}
