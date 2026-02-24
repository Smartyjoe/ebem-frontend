import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { AISearchPanel } from './panels/AISearchPanel';
import { RequestProductPanel } from './panels/RequestProductPanel';
import { CartPanel } from './panels/CartPanel';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Global Slide Panels */}
      <AISearchPanel />
      <RequestProductPanel />
      <CartPanel />
    </div>
  );
}
