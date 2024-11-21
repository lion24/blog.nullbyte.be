"use client";
import { converDate } from "@/lib/formatting";
import { IPost } from "@/lib/notion.types";
//import { Tag } from "./Tag";
import { TagList } from "./TagList";
import Text from "./Text";

type ArticleCardProps = {
  article: IPost;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="flex items-center py-6 border-b border-gray-700">
      {/* Blog Content */}
      <div className="flex-1">
        {/* Publication Date */}
        {article.publishedDate && (
          <p className="text-sm text-gray-400 mb-2">
            {converDate(article.publishedDate)}
          </p>
        )}

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-semibold text-gray-100 hover:text-pink-500 transition-colors"
        >
          <Text title={article.title} />
        </a>

        {/* Tags */}
        <TagList tags={article.tags} />

        {/* Summary */}
        <p className="text-gray-400 mb-4">{article.summary}</p>

        {/* Read More Link */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:underline"
        >
          Read more →
        </a>
      </div>

      {/* Blog Image */}
      {article.coverImageUrl && (
        <div className="ml-6 flex-shrink-0">
          <img
            src={article.coverImageUrl}
            alt=""
            className="w-48 h-36 rounded-md aspect-square object-cover"
          />
        </div>
      )}
    </div>
  );
}
