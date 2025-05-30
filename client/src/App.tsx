import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import AuthPage from "@/pages/auth";
import PassengerDashboard from "@/pages/passenger-dashboard";
import MateDashboard from "@/pages/mate-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import PaymentFlow from "@/pages/payment-flow";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading TrotroPay...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Handle payment flow routing
  if (location.startsWith("#payment/")) {
    const vehicleId = location.split("/")[1];
    return (
      <PaymentFlow 
        vehicleId={vehicleId} 
        onBack={() => setLocation("/")} 
      />
    );
  }

  // Route based on user role
  switch (user.role) {
    case "passenger":
      return <PassengerDashboard />;
    case "mate":
      return <MateDashboard />;
    case "driver":
      return <DriverDashboard />;
    case "owner":
      return <OwnerDashboard />;
    default:
      return <NotFound />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
