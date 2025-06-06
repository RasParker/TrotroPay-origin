import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  Users, 
  TrendingUp, 
  Bell, 
  LogOut, 
  Activity,
  DollarSign,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MateDashboard() {
  const { user, logout } = useAuth();
  const { lastMessage } = useRealtimeUpdates();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: [`/api/dashboard/mate/${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle real-time notifications
  useEffect(() => {
    if (lastMessage?.type === "payment_received") {
      toast({
        title: "Payment Received!",
        description: `GH₵ ${lastMessage.transaction.amount} from ${lastMessage.transaction.passengerPhone}`,
      });
      refetch(); // Refresh dashboard data
    }
  }, [lastMessage, toast, refetch]);

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `GH₵ ${num.toFixed(2)}`;
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-success text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium">Mate Dashboard</h2>
            <p className="text-green-100 text-sm">
              {dashboardData?.vehicle?.route || "No route assigned"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white"
              onClick={() => setLocation("/notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Vehicle Info */}
        {dashboardData?.vehicle && (
          <Card className="gradient-primary text-white mb-4">
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-medium mb-2">Active Route</h3>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-lg font-bold">{dashboardData.vehicle.route}</p>
                <p className="text-green-200 text-sm">
                  Trotro ID: {dashboardData.vehicle.vehicleId}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        

        

        {/* Today's Performance */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="gradient-secondary text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <p className="text-orange-100 text-sm">Today's Collection</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.todayEarnings || "0")}
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-accent text-white">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <p className="text-blue-100 text-sm">Total Passengers</p>
              <p className="text-2xl font-bold">
                {dashboardData?.passengerCount || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Payments Feed */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Live Payments</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {dashboardData?.recentPayments?.length > 0 ? (
              dashboardData.recentPayments.slice(0, 5).map((payment: any) => (
                <Card 
                  key={payment.id} 
                  className={`border animate-slide-in ${
                    payment.isNew ? "border-success bg-green-50" : "border-border"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Passenger Payment
                          </p>
                          <p className="text-sm text-muted-foreground">
                            → {payment.destination}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">
                          +{formatAmount(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No payments yet today</p>
                  <p className="text-sm text-muted-foreground">
                    Payments will appear here in real-time
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border bottom-nav-safe">
        <div className="flex">
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
          >
            <div className="text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Dashboard</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/qr-code" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/qr-code")}
          >
            <div className="text-center">
              <QrCode className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">QR Code</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/earnings" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/earnings")}
          >
            <div className="text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Earnings</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/profile" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/profile")}
          >
            <div className="text-center">
              <User className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Profile</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
