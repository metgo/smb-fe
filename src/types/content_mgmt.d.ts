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
  isHideCategory: boolean;
  contents: IContent[];
}

interface IContentTemplate {
  topic: string;
  isPrimary: boolean;
  isHideTopic?: boolean;
  groups: IContentGroup[];
}
