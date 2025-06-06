import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PaymentFlowProps {
  vehicleId: string;
  onBack: () => void;
}

export default function PaymentFlow({ vehicleId, onBack }: PaymentFlowProps) {
  const [boardingStop, setBoardingStop] = useState("");
  const [alightingStop, setAlightingStop] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [fareAmount, setFareAmount] = useState("0.00");
  const [passengerCount, setPassengerCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState("0.00");
  const [showSuccess, setShowSuccess] = useState(false);
  const [fareCalculation, setFareCalculation] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: [`/api/vehicles/by-id/${vehicleId}`],
    enabled: !!vehicleId,
  });

  const { data: route } = useQuery({
    queryKey: [`/api/routes/${vehicle?.route}`],
    enabled: !!vehicle?.route,
  });

  // Fetch route details by name to get route ID
  const { data: routeDetails } = useQuery({
    queryKey: ['/api/routes'],
    select: (routes: any[]) => routes.find(r => r.name === vehicle?.route),
    enabled: !!vehicle?.route,
  });

  // Fare calculation mutation
  const fareCalculationMutation = useMutation({
    mutationFn: async ({ routeId, boardingStop, alightingStop }: { 
      routeId: number; 
      boardingStop: string; 
      alightingStop: string; 
    }) => {
      return apiRequest('POST', `/api/routes/${routeId}/calculate-fare`, {
        boardingStop,
        alightingStop
      });
    },
    onSuccess: (data) => {
      setFareCalculation(data);
      setFareAmount(data.amount.toFixed(2));
      const total = (data.amount * passengerCount).toFixed(2);
      setTotalAmount(total);
    },
    onError: (error: any) => {
      toast({
        title: "Fare Calculation Error",
        description: error.message || "Failed to calculate fare",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: { vehicleId: string; destination: string; amount: string; passengerCount?: number }) => {
      const response = await apiRequest("POST", "/api/payments/process", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      // Update user balance in auth context
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/passenger/${user?.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment",
        variant: "destructive",
      });
    },
  });

  // Calculate fare based on selected destination and passenger count
  useEffect(() => {
    if (route && selectedDestination) {
      const fareMap = route.fares.reduce((acc: Record<string, string>, fare: string) => {
        const [stop, amount] = fare.split(':');
        acc[stop] = amount;
        return acc;
      }, {});
      
      const amount = fareMap[selectedDestination] || "0.00";
      setFareAmount(amount);
      
      // Calculate total amount for group
      const singleFare = parseFloat(amount);
      const total = (singleFare * passengerCount).toFixed(2);
      setTotalAmount(total);
    }
  }, [route, selectedDestination, passengerCount]);

  const handlePayment = () => {
    if (!selectedDestination) {
      toast({
        title: "Error",
        description: "Please select your destination",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(totalAmount) <= 0) {
      toast({
        title: "Error",
        description: "Invalid fare amount",
        variant: "destructive",
      });
      return;
    }

    paymentMutation.mutate({
      vehicleId,
      destination: selectedDestination,
      amount: totalAmount,
      passengerCount,
    });
  };

  const formatAmount = (amount: string) => `GH₵ ${parseFloat(amount).toFixed(2)}`;

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onBack();
  };

  if (vehicleLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading vehicle information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mobile-container">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-medium ml-3">Payment</h2>
          </div>
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="font-medium text-foreground mb-2">Vehicle Not Found</h3>
              <p className="text-muted-foreground">
                The trotro ID "{vehicleId}" was not found in our system.
              </p>
              <Button onClick={onBack} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-medium">Complete Payment</h2>
        </div>
      </div>

      <div className="p-4">
        {/* Vehicle Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Car className="h-6 w-6 text-primary mr-3" />
              <div>
                <p className="font-medium text-foreground">{vehicle.vehicleId}</p>
                <p className="text-sm text-muted-foreground">{vehicle.route}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Your Destination
          </label>
          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger>
              <SelectValue placeholder="Choose destination..." />
            </SelectTrigger>
            <SelectContent>
              {route?.stops.map((stop: string) => {
                const fareMap = route.fares.reduce((acc: Record<string, string>, fare: string) => {
                  const [stopName, amount] = fare.split(':');
                  acc[stopName] = amount;
                  return acc;
                }, {});
                
                const stopFare = fareMap[stop];
                if (!stopFare || parseFloat(stopFare) === 0) return null;
                
                return (
                  <SelectItem key={stop} value={stop}>
                    {stop} - {formatAmount(stopFare)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Passenger Count Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Number of Passengers
          </label>
          <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count} {count === 1 ? 'passenger' : 'passengers'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fare Display */}
        {selectedDestination && (
          <Card className="bg-green-50 border-success mb-6">
            <CardContent className="p-4">
              {passengerCount === 1 ? (
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Fare Amount</span>
                  <span className="text-2xl font-bold text-success">
                    {formatAmount(fareAmount)}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Per Passenger</span>
                    <span className="text-lg font-medium text-success">
                      {formatAmount(fareAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">
                      Total for {passengerCount} passengers
                    </span>
                    <span className="text-2xl font-bold text-success">
                      {formatAmount(totalAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Group payment: One payment covers all {passengerCount} passengers
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Payment Method
          </label>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Wallet className="h-6 w-6 text-accent" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">MTN Mobile Money</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.phone?.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                  </p>
                </div>
                <span className="text-accent font-medium">
                  {formatAmount(user?.momoBalance || "0")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          className="w-full py-4 text-lg"
          disabled={!selectedDestination || paymentMutation.isPending}
        >
          {paymentMutation.isPending 
            ? "Processing..." 
            : `Pay ${formatAmount(totalAmount)}${passengerCount > 1 ? ` (${passengerCount} passengers)` : ''}`
          }
        </Button>

        {/* Balance Warning */}
        {user && parseFloat(user.momoBalance) < parseFloat(totalAmount) && (
          <Card className="mt-4 border-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-warning">
                    Insufficient balance. Please top up your MoMo account.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/top-up")}
                  className="border-warning text-warning hover:bg-warning hover:text-white"
                >
                  Top Up
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="w-[90vw] max-w-sm mx-auto top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div className="text-center py-6 px-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {passengerCount === 1 ? (
                <>
                  Your fare of <span className="font-medium text-green-600">
                    {formatAmount(totalAmount)}
                  </span> has been paid successfully to {vehicle?.vehicleId}.
                </>
              ) : (
                <>
                  Group payment of <span className="font-medium text-green-600">
                    {formatAmount(totalAmount)}
                  </span> for {passengerCount} passengers has been paid successfully to {vehicle?.vehicleId}.
                  <br />
                  <span className="text-sm text-gray-500 mt-2 block">
                    ({formatAmount(fareAmount)} per passenger)
                  </span>
                </>
              )}
            </p>
            <Button onClick={handleSuccessClose} className="w-full bg-primary hover:bg-primary/90">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
