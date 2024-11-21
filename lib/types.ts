export type Article = {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
  coverImageUrl: string;
  lastEditedDate?: string;
  tags?: string[];
};
