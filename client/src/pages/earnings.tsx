import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface EarningsPageProps {
  onBack: () => void;
}

export default function EarningsPage({ onBack }: EarningsPageProps) {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/mate/${user?.id}`],
    enabled: !!user?.id,
  });

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `GH₵ ${num.toFixed(2)}`;
  };

  const weeklyData = [
    { day: "Mon", amount: 45.50, trips: 18 },
    { day: "Tue", amount: 52.30, trips: 21 },
    { day: "Wed", amount: 38.70, trips: 15 },
    { day: "Thu", amount: 67.80, trips: 27 },
    { day: "Fri", amount: 71.20, trips: 28 },
    { day: "Sat", amount: 23.40, trips: 9 },
    { day: "Sun", amount: 15.60, trips: 6 },
  ];

  const totalWeekly = weeklyData.reduce((sum, day) => sum + day.amount, 0);
  const avgDaily = totalWeekly / 7;
  const commission = parseFloat(dashboardData?.todayEarnings || "0") * 0.10;

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading earnings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-success text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium">Earnings Summary</h2>
            <p className="text-green-200 text-sm">Your collection performance</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <p className="text-green-100 text-sm">Today's Collection</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.todayEarnings || "0")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2" />
              <p className="text-blue-100 text-sm">Your Commission (10%)</p>
              <p className="text-2xl font-bold">
                {formatAmount(commission.toFixed(2))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              This Week's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div 
                  key={day.day} 
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                    index === 3 ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-medium ${index === 3 ? "text-primary" : "text-muted-foreground"}`}>
                      {day.day}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {day.trips} trips
                    </span>
                  </div>
                  <span className={`font-bold ${index === 3 ? "text-primary" : "text-foreground"}`}>
                    {formatAmount(day.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-foreground">Weekly Total</span>
                  <span className="text-primary text-lg">
                    {formatAmount(totalWeekly.toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                  <span>Daily Average</span>
                  <span>{formatAmount(avgDaily.toFixed(2))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Monthly Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Target Amount</span>
                <span className="font-bold text-foreground">{formatAmount("1500.00")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Progress</span>
                <span className="font-bold text-primary">{formatAmount("450.80")}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: "30%" }}
                ></div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                30% of monthly target achieved
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collection Rate:</span>
                <span className="font-medium text-foreground">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium text-foreground">Weekly Payout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Payout:</span>
                <span className="font-medium text-foreground">Friday</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Estimated Weekly Earning:</span>
                  <span className="text-success">{formatAmount((totalWeekly * 0.10).toFixed(2))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}