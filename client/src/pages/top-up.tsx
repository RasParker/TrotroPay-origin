import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, Smartphone, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface TopUpPageProps {
  onBack: () => void;
}

export default function TopUpPage({ onBack }: TopUpPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("mtn");

  const quickAmounts = ["5.00", "10.00", "20.00", "50.00"];

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
      description: `A USSD prompt will be sent to ${user?.phone} to complete the GH₵ ${parseFloat(amount).toFixed(2)} top up.`,
    });
    
    // Simulate USSD prompt
    setTimeout(() => {
      toast({
        title: "Top Up Successful",
        description: `Your wallet has been credited with GH₵ ${parseFloat(amount).toFixed(2)}.`,
      });
      onBack();
    }, 3000);
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
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === "mtn" ? "border-orange-500 bg-orange-50" : "border-border"
              }`}
              onClick={() => setSelectedMethod("mtn")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">MTN Mobile Money</p>
                  <p className="text-sm text-muted-foreground">*170#</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === "vodafone" ? "border-red-500 bg-red-50" : "border-border"
              }`}
              onClick={() => setSelectedMethod("vodafone")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Vodafone Cash</p>
                  <p className="text-sm text-muted-foreground">*110#</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === "airteltigo" ? "border-blue-500 bg-blue-50" : "border-border"
              }`}
              onClick={() => setSelectedMethod("airteltigo")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">AirtelTigo Money</p>
                  <p className="text-sm text-muted-foreground">*100#</p>
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