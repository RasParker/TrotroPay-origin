import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, Smartphone, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TopUpPageProps {
  onBack: () => void;
}

export default function TopUpPage({ onBack }: TopUpPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("mtn");

  const quickAmounts = ["5.00", "10.00", "20.00", "50.00"];

  const topUpMutation = useMutation({
    mutationFn: async (topUpData: { amount: string; method: string }) => {
      return apiRequest("POST", "/api/top-up", topUpData);
    },
    onSuccess: (data) => {
      toast({
        title: "Top Up Successful",
        description: `Your wallet has been credited with GH₵ ${parseFloat(amount).toFixed(2)}.`,
      });
      // Refresh user data and dashboard to show updated balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/passenger/${user?.id}`] });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: "Top Up Failed",
        description: error.message || "Unable to process top up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTopUp = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to top up.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Top Up Initiated",
      description: `Processing GH₵ ${parseFloat(amount).toFixed(2)} top up via ${selectedMethod.toUpperCase()}...`,
    });

    topUpMutation.mutate({
      amount: amount,
      method: selectedMethod
    });
  };

  const formatAmount = (amount: string) => `GH₵ ${parseFloat(amount).toFixed(2)}`;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-accent text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium">Top Up Wallet</h2>
            <p className="text-blue-200 text-sm">Add money to your account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-blue-100 text-sm">Current Balance</p>
            <div className="text-3xl font-bold">
              <span className="text-lg mr-1">GH₵</span>
              <span>{parseFloat(user?.momoBalance || "0").toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant={amount === quickAmount ? "default" : "outline"}
                  onClick={() => setAmount(quickAmount)}
                  className="h-12"
                >
                  <span className="text-sm mr-1">GH₵</span>
                  <span>{parseFloat(quickAmount).toFixed(2)}</span>
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                GH₵
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <div
                onClick={() => setSelectedMethod("mtn")}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "mtn" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">MTN Mobile Money</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("vodafone")}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "vodafone" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Vodafone Cash</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("airteltigo")}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "airteltigo" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">AirtelTigo Money</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("card")}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "card" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Top Up Button */}
        <Button
          onClick={handleTopUp}
          className="w-full py-4 text-lg"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          <Plus className="h-5 w-5 mr-2" />
          Top Up {amount ? (
            <span>
              <span className="text-sm mr-1">GH₵</span>
              <span>{parseFloat(amount).toFixed(2)}</span>
            </span>
          ) : "Wallet"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>You will receive a USSD prompt to complete the payment</p>
        </div>
      </div>
    </div>
  );
}