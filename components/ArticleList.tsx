import { ArticleCard } from "@/components/ArticleCard";
import { IPost } from "@/lib/notion.types";

export function ArticleList({ articles }: { articles: IPost[] }) {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 text-gray-200">
      {articles.map((article: IPost) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
