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
import PassengerHistory from "@/pages/passenger-history";
import PassengerProfile from "@/pages/passenger-profile";
import MateProfile from "@/pages/mate-profile";
import TopUpPage from "@/pages/top-up";
import NotificationsPage from "@/pages/notifications";
import QRCodeDisplay from "@/pages/qr-code-display";
import EarningsPage from "@/pages/earnings";
import DriverPerformance from "@/pages/driver-performance";
import SettingsPage from "@/pages/settings";
import FareCalculator from "@/pages/fare-calculator";
import FareManagement from "@/pages/fare-management";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Debug logging
  console.log("Current location in AppRouter:", location);

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

  // Handle special routing - check for payment routes
  if (location.includes("payment/")) {
    const vehicleId = location.split("/").pop() || location.replace("#payment/", "");
    console.log("Payment flow detected, vehicleId:", vehicleId);
    return (
      <PaymentFlow 
        vehicleId={vehicleId} 
        onBack={() => setLocation("/")} 
      />
    );
  }

  // Handle page navigation
  if (location === "/history") {
    return <PassengerHistory onBack={() => setLocation("/")} />;
  }
  if (location === "/profile") {
    if (user.role === "passenger") {
      return <PassengerProfile onBack={() => setLocation("/")} />;
    } else if (user.role === "mate") {
      return <MateProfile onBack={() => setLocation("/")} />;
    }
    return <PassengerProfile onBack={() => setLocation("/")} />;
  }
  if (location === "/top-up") {
    return <TopUpPage onBack={() => setLocation("/")} />;
  }
  if (location === "/notifications") {
    return <NotificationsPage onBack={() => setLocation("/")} />;
  }
  if (location === "/qr-code") {
    return <QRCodeDisplay onBack={() => setLocation("/")} />;
  }
  if (location === "/earnings") {
    return <EarningsPage onBack={() => setLocation("/")} />;
  }
  if (location === "/performance") {
    return <DriverPerformance onBack={() => setLocation("/")} />;
  }
  if (location === "/settings") {
    return <SettingsPage onBack={() => setLocation("/")} />;
  }
  if (location === "/fare-calculator") {
    return <FareCalculator onBack={() => setLocation("/")} />;
  }
  if (location === "/fare-management") {
    return <FareManagement onBack={() => setLocation("/")} />;
  }

  // Route based on user role (default dashboard)
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
