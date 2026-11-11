'use client';

import { useState } from 'react';
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
  translations: {
    share: string;
    shareOnFacebook: string;
    shareOnX: string;
    shareOnReddit: string;
    copyLink: string;
  };
}

export default function SocialShare({ url, title, translations }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="bl-share">
      <span className="bl-share__label">{translations.share}</span>
      <div className="bl-share__list">
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="bl-share__btn bl-share__btn--facebook"
          aria-label={translations.shareOnFacebook}
        >
          <FontAwesomeIcon icon={faFacebook} />
        </a>
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="bl-share__btn bl-share__btn--x"
          aria-label={translations.shareOnX}
        >
          <FontAwesomeIcon icon={faXTwitter} />
        </a>
        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="bl-share__btn bl-share__btn--reddit"
          aria-label={translations.shareOnReddit}
        >
          <FontAwesomeIcon icon={faReddit} />
        </a>
        <button
          type="button"
          onClick={copyToClipboard}
          className="bl-share__btn bl-share__btn--copy"
          data-copied={copied ? 'true' : undefined}
          aria-label={translations.copyLink}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faLink} />
        </button>
      </div>
    </div>
  );
}
