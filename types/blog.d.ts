declare interface BlogFeed {
  _id: string;
  title: string;
  subTitle: string;
  content: string;
  images: ImageItem[];
}

declare interface BlogFeedItems {
  blogs: BlogFeed[];
}
