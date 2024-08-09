export interface StorageAdapter {
  readonly upload: (
    location: string,
    content: Buffer | ArrayBuffer,
  ) => Promise<void>;
  readonly getUrl: (location: string) => string;
  readonly delete: (location: string) => Promise<void>;
}

export class Storage {
  constructor(private readonly adapter: StorageAdapter) {}

  upload(location: string, content: Buffer | ArrayBuffer) {
    return this.adapter.upload(location, content);
  }

  getUrl(location: string) {
    return this.adapter.getUrl(location);
  }

  delete(location: string) {
    return this.adapter.delete(location);
  }
}
