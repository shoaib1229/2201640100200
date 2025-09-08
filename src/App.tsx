import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import URLShortener from "./pages/URLShortener";
import Statistics from "./pages/Statistics";
import Redirect from "./pages/Redirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect page for shortened URLs - must be first to catch shortcodes */}
          <Route path="/:shortCode" element={<Redirect />} />
          
          {/* Main app pages with layout */}
          <Route path="/" element={
            <Layout>
              <URLShortener />
            </Layout>
          } />
          <Route path="/stats" element={
            <Layout>
              <Statistics />
            </Layout>
          } />
          
          {/* 404 page */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
