interface IContentTemplate {
  title: string;
  subTitle: string;
  description: string;
  contents: {
    _id: string;
    name: string;
    desc: string;
    imageUrl: string;
    category: string;
  }[]
}
