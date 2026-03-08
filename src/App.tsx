import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import AnalysisLoading from "./pages/AnalysisLoading";
import ScanDetail from "./pages/ScanDetail";
import ScanHistory from "./pages/ScanHistory";
import Journal from "./pages/Journal";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Referrals from "./pages/Referrals";
import AdminAnalytics from "./pages/AdminAnalytics";
import SkincareRoutine from "./pages/SkincareRoutine";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/scan/new" element={<ProtectedRoute><NewScan /></ProtectedRoute>} />
            <Route path="/scan/analyzing/:scanId" element={<ProtectedRoute><AnalysisLoading /></ProtectedRoute>} />
            <Route path="/scan/:scanId" element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/routine" element={<ProtectedRoute><SkincareRoutine /></ProtectedRoute>} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
