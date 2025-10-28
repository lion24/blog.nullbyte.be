'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faXTwitter,
  faReddit,
} from '@fortawesome/free-brands-svg-icons';
import { faLink, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SocialShareProps {
  url: string;
  title: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('social');

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const buttonClass =
    'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {t('share')}
      </span>
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          style={{ backgroundColor: '#1877F2' }}
          aria-label={t('shareOnFacebook')}
        >
          <FontAwesomeIcon icon={faFacebook} className="text-white text-lg" />
        </a>

        {/* X (Twitter) */}
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          style={{ backgroundColor: '#000000' }}
          aria-label={t('shareOnX')}
        >
          <FontAwesomeIcon icon={faXTwitter} className="text-white text-lg" />
        </a>

        {/* Reddit */}
        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          style={{ backgroundColor: '#FF4500' }}
          aria-label={t('shareOnReddit')}
        >
          <FontAwesomeIcon icon={faReddit} className="text-white text-lg" />
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={buttonClass}
          style={{ backgroundColor: copied ? '#10B981' : 'var(--background-secondary)' }}
          aria-label={t('copyLink')}
        >
          <FontAwesomeIcon
            icon={copied ? faCheck : faLink}
            className="text-lg"
            style={{ color: copied ? 'white' : 'var(--text-primary)' }}
          />
        </button>
      </div>
    </div>
  );
}
