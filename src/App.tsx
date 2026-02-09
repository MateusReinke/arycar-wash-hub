import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewWorkOrder from "@/pages/NewWorkOrder";
import WorkOrderDetail from "@/pages/WorkOrderDetail";
import DeliveryPage from "@/pages/Delivery";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/os/nova" element={<ProtectedRoute><AppLayout><NewWorkOrder /></AppLayout></ProtectedRoute>} />
            <Route path="/os/:id" element={<ProtectedRoute><AppLayout><WorkOrderDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/os/:id/entrega" element={<ProtectedRoute><AppLayout><DeliveryPage /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
