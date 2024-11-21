export interface ITag {
  id: string;
  name: string;
  color?: string;
}

export interface IPost {
  id: string;
  title: string;
  tags: ITag[];
  summary: string;
  url: string;
  slug?: string;
  modifiedDate?: string;
  publishedDate?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
}
