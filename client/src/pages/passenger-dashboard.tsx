import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Edit3, Plus, History, User, Home, Bell, LogOut, Users, Calculator, Search, MapPin } from "lucide-react";
import { QRScanner } from "@/components/ui/qr-scanner";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentFlow from "@/pages/payment-flow";


export default function PassengerDashboard() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVehicleId, setManualVehicleId] = useState("");
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentVehicleId, setPaymentVehicleId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedBoardingStop, setSelectedBoardingStop] = useState("");
  const [selectedAlightingStop, setSelectedAlightingStop] = useState("");
  const [calculatedFare, setCalculatedFare] = useState<any>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/passenger/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch all routes for search
  const { data: routes } = useQuery({
    queryKey: ['/api/routes'],
  });

  // Safely extract data with fallbacks
  const userData = (dashboardData as any)?.user || user;
  const recentTransactions = (dashboardData as any)?.recentTransactions || [];

  // Filter routes based on search query
  const filteredRoutes = Array.isArray(routes) ? routes.filter((route: any) => 
    route.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.startPoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.endPoint?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleRouteSearch = (routeId: string) => {
    const route = Array.isArray(routes) ? routes.find((r: any) => r.id.toString() === routeId) : null;
    if (route) {
      setSelectedRoute(routeId);
      // Reset subsequent steps when route changes
      setSelectedBoardingStop("");
      setSelectedAlightingStop("");
      setCalculatedFare(null);
    }
  };

  const handleBoardingStopSelect = (stop: string) => {
    setSelectedBoardingStop(stop);
    // Reset subsequent steps when boarding stop changes
    setSelectedAlightingStop("");
    setCalculatedFare(null);
  };

  // Custom fare calculation function
  const calculateTripFare = (route: any, boardingStop: string, alightingStop: string) => {
    const stops = route.stops || [];
    const boardingIndex = stops.indexOf(boardingStop);
    const alightingIndex = stops.indexOf(alightingStop);
    
    if (boardingIndex === -1 || alightingIndex === -1 || boardingIndex >= alightingIndex) {
      return null;
    }
    
    const distance = alightingIndex - boardingIndex;
    const baseFare = route.baseFare || 2.5;
    const farePerStop = route.farePerKm || 0.3;
    const amount = baseFare + (distance * farePerStop);
    
    return {
      amount,
      boardingStop,
      alightingStop,
      distance,
      route: route.name
    };
  };

  const formatFareAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  const getValidStops = (stops: string[], boardingStop: string) => {
    const boardingIndex = stops.indexOf(boardingStop);
    return boardingIndex !== -1 ? stops.slice(boardingIndex + 1) : [];
  };

  const handleAlightingStopSelect = (stop: string) => {
    setSelectedAlightingStop(stop);
    
    // Calculate fare when both stops are selected
    const route = (routes as any[])?.find((r: any) => r.id.toString() === selectedRoute);
    if (route && selectedBoardingStop && stop) {
      const fareCalculation = calculateTripFare(route, selectedBoardingStop, stop);
      setCalculatedFare(fareCalculation);
    }
  };

  const handleQRScan = (vehicleId: string) => {
    setShowQRScanner(false);
    // Navigate to payment flow with the scanned vehicle ID
    setLocation(`#payment/${vehicleId}`);
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
    setLocation(`#payment/${manualVehicleId}`);
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

  if (isLoading || !user) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show payment flow if requested
  if (showPaymentFlow) {
    return (
      <PaymentFlow 
        vehicleId={paymentVehicleId} 
        onBack={() => setShowPaymentFlow(false)} 
      />
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="gradient-primary text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium">Hello, {userData?.name || "Passenger"}</h2>
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
                  {formatAmount(userData?.momoBalance || "0")}
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

        {/* Progressive Trip Search and Payment Flow */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Book Your Trip</h3>
            </div>
            
            {/* Step 1: Route Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">1. Select Route</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search routes (e.g., 192, Circle - Lapaz, Tema)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchQuery && filteredRoutes.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {filteredRoutes.map((route: any) => (
                      <div
                        key={route.id}
                        onClick={() => handleRouteSearch(route.id.toString())}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedRoute === route.id.toString() ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold text-primary text-lg">{route.code}</span>
                          <span className="font-medium">{route.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-7">
                          {route.startPoint} → {route.endPoint}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && filteredRoutes.length === 0 && (
                  <div className="p-3 text-center text-muted-foreground mt-2">
                    No routes found for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Step 2: Boarding Stop Selection */}
              {selectedRoute && (
                <div>
                  <label className="block text-sm font-medium mb-2">2. Select Boarding Stop</label>
                  <Select value={selectedBoardingStop} onValueChange={handleBoardingStopSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose where you'll board" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const route = Array.isArray(routes) ? routes.find((r: any) => r.id.toString() === selectedRoute) : null;
                        const stops = route?.stops || [];
                        return stops.map((stop: string, index: number) => (
                          <SelectItem key={index} value={stop}>
                            {stop}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 3: Alighting Stop Selection */}
              {selectedRoute && selectedBoardingStop && (
                <div>
                  <label className="block text-sm font-medium mb-2">3. Select Alighting Stop</label>
                  <Select value={selectedAlightingStop} onValueChange={handleAlightingStopSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose where you'll get off" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const route = Array.isArray(routes) ? routes.find((r: any) => r.id.toString() === selectedRoute) : null;
                        const validStops = getValidStops(route?.stops || [], selectedBoardingStop);
                        return validStops.map((stop: string, index: number) => (
                          <SelectItem key={index} value={stop}>
                            {stop}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 4: Fare Display */}
              {calculatedFare && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-1">Total Fare</div>
                    <div className="text-2xl font-bold text-blue-900">
                      GH₵ {formatFareAmount(calculatedFare.amount)}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {calculatedFare.boardingStop} → {calculatedFare.alightingStop}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Options - Only show when fare is calculated */}
        {calculatedFare && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">4. Choose Payment Type</h3>
          
          {/* Self Payment */}
          <Card className="mb-4 border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Pay for Yourself</h4>
                    <p className="text-sm text-blue-600">Single passenger payment</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowQRScanner(true)}
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <div className="text-center">
                    <QrCode className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm">Scan QR</span>
                  </div>
                </Button>
                <Button
                  onClick={() => setShowManualEntry(true)}
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <div className="text-center">
                    <Edit3 className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm">Enter ID</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Group Payment */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Pay for Group</h4>
                    <p className="text-sm text-green-600">Multiple passengers (2-8 people)</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setPaymentVehicleId("GT-1234-20");
                  setShowPaymentFlow(true);
                }}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Try Group Payment</span>
                </div>
              </Button>
            </CardContent>
          </Card>
          </div>
        )}

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
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction: any) => (
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
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-border bottom-nav-safe">
        <div className="flex">
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
          >
            <div className="text-center">
              <Home className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Home</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/fare-calculator" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/fare-calculator")}
          >
            <div className="text-center">
              <Calculator className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Fare Calc</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/history" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/history")}
          >
            <div className="text-center">
              <History className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">History</span>
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
