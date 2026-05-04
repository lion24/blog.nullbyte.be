import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MainLayout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation locale={locale} />
      <main className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
