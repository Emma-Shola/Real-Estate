import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import RequireAuth from "@/components/RequireAuth";
import PublicChatbot from "@/components/PublicChatbot";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import PropertiesPage from "@/pages/PropertiesPage";
import PropertyFormPage from "@/pages/PropertyFormPage";
import LeadsPage from "@/pages/LeadsPage";
import AIToolsPage from "@/pages/AIToolsPage";
import ProfilePage from "@/pages/ProfilePage";
import PublicLeadForm from "@/pages/PublicLeadForm";
import PublicListingsPage from "@/pages/PublicListingsPage";
import PublicPropertyDetailsPage from "@/pages/PublicPropertyDetailsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PublicChatbot />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/listings" replace />} />
            <Route path="/listings" element={<PublicListingsPage />} />
            <Route path="/listings/:id" element={<PublicPropertyDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/inquiry" element={<PublicLeadForm />} />

            {/* Protected */}
            <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/new" element={<PropertyFormPage />} />
              <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/ai-tools" element={<AIToolsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
