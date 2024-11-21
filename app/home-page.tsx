// "use client";

import { ArticleList } from "@/components/ArticleList";
import { IPost } from "@/lib/notion.types";

export default function HomePage({ recentPosts }: { recentPosts: IPost[] }) {
  return (
    <div>
      <ArticleList articles={recentPosts} />
    </div>
  );
}
