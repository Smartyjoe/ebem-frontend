import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { AISearchPanel } from './panels/AISearchPanel';
import { RequestProductPanel } from './panels/RequestProductPanel';
import { CartPanel } from './panels/CartPanel';
import { captureAffiliateRefFromSearch, captureAffiliateSignupCompletion } from '../services/affiliate';
import { AffiliateTriggerSystem } from './affiliate/AffiliateTriggerSystem';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    captureAffiliateRefFromSearch(location.search);
    captureAffiliateSignupCompletion(location.search);
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AffiliateTriggerSystem />

      {/* Global Slide Panels */}
      <AISearchPanel />
      <RequestProductPanel />
      <CartPanel />
    </div>
  );
}
