import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations('auth');
  const tLegal = await getTranslations('legal.common');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image src="/logo.png" alt="NullByte" width={32} height={32} className="rounded" />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>NullByte</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/auth/register`}
            className="text-sm px-4 py-2 rounded-md border transition-colors"
            style={{
              backgroundColor: 'var(--background-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border)',
            }}
          >
            {t('createAccount')}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer
        className="px-6 py-6 text-center text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <p>
          <Link href={`/${locale}/legal/terms`} className="underline hover:no-underline">
            {tLegal('terms')}
          </Link>
          {' · '}
          <Link href={`/${locale}/legal/privacy`} className="underline hover:no-underline">
            {tLegal('privacy')}
          </Link>
          {' · '}
          <Link href={`/${locale}/legal/data-deletion`} className="underline hover:no-underline">
            {tLegal('dataDeletion')}
          </Link>
        </p>
      </footer>
    </div>
  );
}
