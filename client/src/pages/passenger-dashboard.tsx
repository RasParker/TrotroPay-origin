import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Edit3, Plus, History, User, Home, Bell, LogOut } from "lucide-react";
import { QRScanner } from "@/components/ui/qr-scanner";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PassengerDashboard() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVehicleId, setManualVehicleId] = useState("");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/passenger/${user?.id}`],
    enabled: !!user?.id,
  });

  const handleQRScan = (vehicleId: string) => {
    setShowQRScanner(false);
    // Navigate to payment flow with the scanned vehicle ID
    window.location.hash = `#payment/${vehicleId}`;
  };

  const handleManualEntry = () => {
    if (!manualVehicleId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Trotro ID",
        variant: "destructive",
      });
      return;
    }
    setShowManualEntry(false);
    window.location.hash = `#payment/${manualVehicleId}`;
  };

  const formatAmount = (amount: string) => `GH₵ ${parseFloat(amount).toFixed(2)}`;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-GB");
    }
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
      <div className="gradient-primary text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium">Hello, {dashboardData?.user?.name || "Passenger"}</h2>
            <p className="text-green-200 text-sm">Ready for your journey?</p>
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
        {/* Balance Card */}
        <Card className="gradient-accent text-white mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold">
                  {formatAmount(dashboardData?.user?.momoBalance || "0")}
                </p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/20 text-white border-0 hover:bg-white/30"
                onClick={() => setLocation("/top-up")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowQRScanner(true)}
            className="h-20 bg-white text-primary border-2 border-primary hover:bg-blue-50"
            variant="outline"
          >
            <div className="text-center">
              <QrCode className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Scan QR</span>
            </div>
          </Button>
          <Button
            onClick={() => setShowManualEntry(true)}
            className="h-20"
            variant="outline"
          >
            <div className="text-center">
              <Edit3 className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Enter ID</span>
            </div>
          </Button>
        </div>

        {/* Group Payment Demo */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setManualVehicleId("GT-1234-20");
              setShowManualEntry(false);
              window.location.hash = "#payment/GT-1234-20";
            }}
            className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700"
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-1" />
              <span className="font-medium">Try Group Payment</span>
              <p className="text-xs opacity-90">Pay for multiple passengers</p>
            </div>
          </Button>
        </div>

        {/* Recent Trips */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Trips</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/history")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {dashboardData?.recentTransactions?.length > 0 ? (
              dashboardData.recentTransactions.map((transaction: any) => (
                <Card key={transaction.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span className="font-medium text-foreground">
                            {transaction.route}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          → {transaction.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}, {formatTime(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatAmount(transaction.amount)}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-success">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trips yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start by scanning a QR code or entering a Trotro ID
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-border bottom-nav-safe">
        <div className="flex">
          <Button variant="ghost" className="flex-1 py-3 text-primary">
            <div className="text-center">
              <Home className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Home</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 py-3 text-muted-foreground"
            onClick={() => setLocation("/history")}
          >
            <div className="text-center">
              <History className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">History</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 py-3 text-muted-foreground"
            onClick={() => setLocation("/profile")}
          >
            <div className="text-center">
              <User className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Profile</span>
            </div>
          </Button>
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="w-full max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Enter Trotro ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="e.g., GT-1234-20"
              value={manualVehicleId}
              onChange={(e) => setManualVehicleId(e.target.value.toUpperCase())}
              className="text-center"
            />
            <Button onClick={handleManualEntry} className="w-full">
              Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
