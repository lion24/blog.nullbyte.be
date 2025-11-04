'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

type PostCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    createdAt: string;
    readingTime: number;
    author: {
      name: string | null;
    };
    tags: Array<{ id: string; name: string; slug: string }>;
    categories: Array<{ id: string; name: string }>;
  };
  locale: string;
};

export default function PostCard({ post, locale }: PostCardProps) {
  const t = useTranslations();

  const truncateExcerpt = (text: string | null, maxLength: number = 150): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <article
      className="p-6 rounded-lg transition-all flex flex-col h-full"
      style={{
        backgroundColor: 'var(--background-secondary)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Categories - Top */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.map((category) => (
            <span
              key={category.id}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                opacity: 0.9,
              }}
            >
              {category.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
        <Link
          href={`/${locale}/posts/${post.slug}`}
          className="transition-colors hover:underline"
          style={{ color: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
        >
          {post.title}
        </Link>
      </h3>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mb-4 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {truncateExcerpt(post.excerpt)}
        </p>
      )}

      {/* Metadata - Bottom */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Date and Reading Time */}
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
          <time>{new Date(post.createdAt).toLocaleDateString()}</time>
          <span>•</span>
          <span>{t('common.readingTime', { minutes: post.readingTime })}</span>
        </div>

        {/* Tags and Read More */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/${locale}/tags/${tag.slug}`}
                className="text-xs font-bold transition-colors hover:underline truncate"
                style={{ color: 'var(--tag-background)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--tag-background-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--tag-background)')}
              >
                #{tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span 
                className="text-xs font-bold"
                style={{ color: 'var(--tag-background)' }}
              >
                +{post.tags.length - 3}
              </span>
            )}
          </div>
          <Link
            href={`/${locale}/posts/${post.slug}`}
            className="text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--primary)')}
          >
            {t('common.readMore')} →
          </Link>
        </div>
      </div>
    </article>
  );
}
