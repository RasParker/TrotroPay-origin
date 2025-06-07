import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, CreditCard, Smartphone, CheckCircle, AlertCircle, Plus, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PaymentFlowProps {
  vehicleId: string;
  fareAmount: string;
  onBack: () => void;
  isSinglePassenger?: boolean;
}

export default function PaymentFlowNew({ vehicleId, fareAmount: propFareAmount, onBack, isSinglePassenger = false }: PaymentFlowProps) {
  const [passengerCount, setPassengerCount] = useState(isSinglePassenger ? 1 : 1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(propFareAmount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Get user data to check wallet balance
  const { data: userData, refetch: refetchUserData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
  });

  // Refresh user data when component mounts or when returning from top-up
  useEffect(() => {
    if (user?.id) {
      refetchUserData();
    }
  }, [user?.id, refetchUserData]);

  // Also refresh when component becomes visible again (e.g., returning from top-up)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        refetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, refetchUserData]);

  const currentBalance = parseFloat((userData as any)?.user?.momoBalance || "0");
  const paymentAmount = parseFloat(totalAmount);
  const hasInsufficientBalance = currentBalance < paymentAmount;

  const formatAmount = (amount: string) => {
    return `GH₵ ${parseFloat(amount).toFixed(2)}`;
  };

  // Payment methods available
  const paymentMethods = [
    { 
      id: "wallet", 
      name: "Wallet Balance", 
      icon: Wallet,
      balance: formatAmount((userData as any)?.user?.momoBalance || "0"),
      insufficient: hasInsufficientBalance
    },
    { id: "mtn", name: "MTN Mobile Money", icon: Smartphone },
    { id: "vodafone", name: "Vodafone Cash", icon: Smartphone },
    { id: "airteltigo", name: "AirtelTigo Money", icon: Smartphone },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard }
  ];

  // Update total when passenger count changes
  useEffect(() => {
    const fare = parseFloat(propFareAmount);
    const total = (fare * passengerCount).toFixed(2);
    setTotalAmount(total);
  }, [propFareAmount, passengerCount]);

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: { vehicleId: string; amount: string; passengerCount: number; paymentMethod: string; destination: string }) => {
      const response = await apiRequest("POST", "/api/payments/process", paymentData);
      return response;
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/passenger/${user?.id}`] });
    },
    onError: (error: any) => {
      if (error.message === "Insufficient balance") {
        setShowInsufficientBalance(true);
      } else {
        toast({
          title: "Payment Failed",
          description: error.message || "Unable to process payment",
          variant: "destructive",
        });
      }
    },
  });

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    paymentMutation.mutate({
      vehicleId: vehicleId,
      amount: totalAmount,
      passengerCount: passengerCount,
      paymentMethod: selectedPaymentMethod,
      destination: "General Transit" // Default destination for single payments
    });
  };

  if (showSuccess) {
    return (
      <Dialog open={showSuccess} onOpenChange={() => setShowSuccess(false)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-center text-muted-foreground mb-4">
              Your payment of {formatAmount(totalAmount)} has been processed successfully.
            </p>
            <Button onClick={onBack} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showInsufficientBalance) {
    return (
      <Dialog open={showInsufficientBalance} onOpenChange={() => setShowInsufficientBalance(false)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-heading-2 mb-2">Insufficient Balance</h2>
            <p className="text-center text-muted-foreground mb-4">
              You need {formatAmount(totalAmount)} to complete this payment. Your current balance is too low.
            </p>
            <div className="space-y-3 w-full">
              <Button onClick={() => setLocation("/top-up")} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Top Up Wallet
              </Button>
              <Button variant="outline" onClick={onBack} className="w-full">
                Go Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-heading-2 ml-2">Complete Payment</h1>
        </div>

        {/* Trip Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-heading-3">Trip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle ID:</span>
                <span className="font-medium">{vehicleId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fare per person:</span>
                <span className="font-medium">{formatAmount(propFareAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of passengers:</span>
                <span className="font-medium">{passengerCount}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary">{formatAmount(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Number of Passengers - Hidden for single passenger payments */}
        {!isSinglePassenger && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Number of Passengers</h3>
              </div>
              <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} passenger{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="text-heading-3 mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isWallet = method.id === "wallet";
                const isDisabled = isWallet && method.insufficient;
                
                return (
                  <div
                    key={method.id}
                    onClick={() => !isDisabled && setSelectedPaymentMethod(method.id)}
                    className={`p-3 border rounded-lg transition-colors ${
                      isDisabled
                        ? "border-red-200 bg-red-50 cursor-not-allowed"
                        : selectedPaymentMethod === method.id 
                          ? "border-primary bg-primary/5 cursor-pointer" 
                          : "border-border hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${
                          isDisabled ? "text-red-400" : "text-muted-foreground"
                        }`} />
                        <span className={`font-medium ${
                          isDisabled ? "text-red-600" : ""
                        }`}>
                          {method.name}
                        </span>
                      </div>
                      {isWallet && (
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            isDisabled ? "text-red-600" : "text-foreground"
                          }`}>
                            {method.balance}
                          </div>
                          {isDisabled && (
                            <div className="text-xs text-red-500">
                              Insufficient funds
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={!selectedPaymentMethod || paymentMutation.isPending}
          className="w-full h-14 text-lg font-semibold"
        >
          {paymentMutation.isPending ? (
            "Processing..."
          ) : (
            `Pay ${formatAmount(totalAmount)}`
          )}
        </Button>
      </div>
    </div>
  );
}