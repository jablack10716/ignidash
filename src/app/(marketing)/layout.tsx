import Footer from '@/components/layout/footer';

import Navbar from './components/navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark:bg-stone-900">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
