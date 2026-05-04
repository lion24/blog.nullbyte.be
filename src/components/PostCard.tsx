import Link from 'next/link';

type PostCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    createdAt: string;
    readingTime: number;
    readingTimeText: string; // Pre-formatted reading time text
    author: {
      name: string | null;
    };
    tags: Array<{ id: string; name: string; slug: string }>;
    categories: Array<{ id: string; name: string; slug: string }>;
  };
  locale: string;
  translations: {
    readMore: string;
  };
};

function truncate(text: string | null, maxLength = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export default function PostCard({ post, locale, translations }: PostCardProps) {
  return (
    <article
      className="post-card p-6 rounded-lg flex flex-col h-full"
      style={{
        backgroundColor: 'var(--background-secondary)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Categories - Top */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className="post-card-category text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
              }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
        <Link
          href={`/${locale}/posts/${post.slug}`}
          className="post-card-title-link transition-colors hover:underline"
          style={{ color: 'inherit' }}
        >
          {post.title}
        </Link>
      </h3>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mb-4 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {truncate(post.excerpt)}
        </p>
      )}

      {/* Metadata - Bottom */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Date and Reading Time */}
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString(locale)}</time>
          <span>•</span>
          <span>{post.readingTimeText}</span>
        </div>

        {/* Tags and Read More */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/${locale}/tags/${tag.slug}`}
                className="post-card-tag text-xs font-bold transition-colors hover:underline truncate"
                style={{ color: 'var(--tag-background)' }}
              >
                #{tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs font-bold" style={{ color: 'var(--tag-background)' }}>
                +{post.tags.length - 3}
              </span>
            )}
          </div>
          <Link
            href={`/${locale}/posts/${post.slug}`}
            className="post-card-readmore text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
            style={{ color: 'var(--primary)' }}
          >
            {translations.readMore} →
          </Link>
        </div>
      </div>
    </article>
  );
}
