interface IContent {
  _id: string;
  name: string;
  desc: string;
  imageUrl: string;
  category: string;
}

interface IContentGroup {
  category: string;
  isPrimary: boolean;
  contents: IContent[];
}

interface IContentTemplate {
  header: string;
  topic: string;
  isPrimary: boolean;
  groups: IContentGroup[];
}
