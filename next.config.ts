import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
        pathname: '/**',
      },
      { // For placeholder images in the editor (test/dev purposes)
        protocol: 'https',
        hostname: 'placekittens.com',
        pathname: '/**',
      },
    ],
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(config);
