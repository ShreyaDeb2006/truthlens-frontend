import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import ScanPage from "@/pages/ScanPage";
import DocumentScanPage from "@/pages/DocumentScanPage";
import ResultsPage from "@/pages/ResultsPage";
import DocumentResultsPage from "@/pages/DocumentResultsPage";
import HistoryPage from "@/pages/HistoryPage";
import PricingPage from "@/pages/PricingPage";
import ExtensionPage from "@/pages/ExtensionPage";
import DocsPage from "@/pages/DocsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/scan" component={ScanPage} />
      <ProtectedRoute path="/document-scan" component={DocumentScanPage} />
      <Route path="/results/:id" component={ResultsPage} />
      <Route path="/document-results/:id" component={DocumentResultsPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/extension" component={ExtensionPage} />
      <Route path="/docs" component={DocsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
