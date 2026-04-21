import { GetAllBlogsRequest } from './get-all-blogs.request';

export class GetAllBlogsQuery {
  constructor(public readonly request: GetAllBlogsRequest) {}
}
