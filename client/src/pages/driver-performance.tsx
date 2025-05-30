import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Clock, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface PerformancePageProps {
  onBack: () => void;
}

export default function DriverPerformance({ onBack }: PerformancePageProps) {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/driver/${user?.id}`],
    enabled: !!user?.id,
  });

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `GH₵ ${num.toFixed(2)}`;
  };

  const weeklyData = [
    { day: "Mon", earnings: 52.30, trips: 21, hours: 8 },
    { day: "Tue", earnings: 48.70, trips: 19, hours: 7.5 },
    { day: "Wed", earnings: 65.80, trips: 26, hours: 9 },
    { day: "Thu", earnings: 71.20, trips: 28, hours: 8.5 },
    { day: "Fri", earnings: 67.40, trips: 25, hours: 8 },
    { day: "Sat", earnings: 43.20, trips: 17, hours: 6 },
    { day: "Sun", earnings: 31.50, trips: 12, hours: 5 },
  ];

  const totalWeeklyEarnings = weeklyData.reduce((sum, day) => sum + day.earnings, 0);
  const totalTrips = weeklyData.reduce((sum, day) => sum + day.trips, 0);
  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const avgEarningsPerTrip = totalWeeklyEarnings / totalTrips;
  const avgEarningsPerHour = totalWeeklyEarnings / totalHours;

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="gradient-accent text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium">Performance Analytics</h2>
            <p className="text-blue-200 text-sm">Your driving statistics</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <p className="text-green-100 text-sm">Today's Earnings</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.grossEarnings || "0")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2" />
              <p className="text-blue-100 text-sm">Your Share (15%)</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.driverShare || "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Avg/Trip</p>
              <p className="font-bold text-foreground">{formatAmount(avgEarningsPerTrip.toFixed(2))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-xs text-muted-foreground">Avg/Hour</p>
              <p className="font-bold text-foreground">{formatAmount(avgEarningsPerHour.toFixed(2))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-success" />
              <p className="text-xs text-muted-foreground">Total Trips</p>
              <p className="font-bold text-foreground">{totalTrips}</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{day.day}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        {formatAmount(day.earnings)}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {day.trips} trips • {day.hours}h
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(day.earnings / Math.max(...weeklyData.map(d => d.earnings))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Best Performance</span>
                </div>
                <p className="text-sm text-green-700">
                  Thursday was your best day with {formatAmount("71.20")} in earnings
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Peak Hours</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your highest earnings are typically between 7 AM - 9 AM and 5 PM - 7 PM
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Weekly Goal</span>
                </div>
                <p className="text-sm text-orange-700">
                  You're 85% towards your weekly target of {formatAmount("400.00")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Commission:</span>
                <span className="font-medium text-foreground">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly Earnings:</span>
                <span className="font-medium text-foreground">{formatAmount((totalWeeklyEarnings * 0.15).toFixed(2))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Schedule:</span>
                <span className="font-medium text-foreground">Every Friday</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Next Payout:</span>
                  <span className="text-success">{formatAmount((totalWeeklyEarnings * 0.15).toFixed(2))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}