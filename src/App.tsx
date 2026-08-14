import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminPage from './pages/AdminPage';
import EmbedPage from './pages/EmbedPage';
import NestedPage from './pages/NestedPage';
import NotFound from './pages/NotFound';
import LongtreeProductionDashboard from './pages/LongtreeProductionDashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/embed/:id" element={<EmbedPage />} />
          <Route path="/nested/:id" element={<NestedPage />} />
          <Route path="/longtree-production-dashboard" element={<LongtreeProductionDashboard />} />
          <Route path="/longtree-production-dashboard/:locale" element={<LongtreeProductionDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
