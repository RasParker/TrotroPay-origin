import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Car, 
  TrendingUp, 
  Users, 
  Bell, 
  LogOut, 
  Plus,
  BarChart3,
  Settings,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/owner/${user?.id}`],
    enabled: !!user?.id,
  });

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `GH₵ ${num.toFixed(2)}`;
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
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium">Fleet Management</h2>
            <p className="text-purple-100 text-sm">
              {dashboardData?.vehicles?.length || 0} vehicles active
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
        {/* Total Earnings Overview */}
        <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white mb-6">
          <CardContent className="p-4">
            <Building2 className="h-8 w-8 mb-2" />
            <p className="text-purple-100 text-sm">Total Net Income (Today)</p>
            <p className="text-3xl font-bold">
              {formatAmount(dashboardData?.netProfit || "0")}
            </p>
            <p className="text-purple-100 text-sm">
              From {dashboardData?.vehicles?.length || 0} vehicles
            </p>
          </CardContent>
        </Card>

        {/* Vehicle Performance Cards */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-foreground">Vehicle Performance</h3>

          {dashboardData?.vehicles?.length > 0 ? (
            dashboardData.vehicles.map((vehicle: any) => (
              <Card key={vehicle.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {vehicle.vehicleId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.route}
                      </p>
                    </div>
                    <Badge className="bg-success text-white">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatAmount(vehicle.grossEarnings)}
                      </p>
                      <p className="text-xs text-muted-foreground">Gross</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatAmount(vehicle.commissions)}
                      </p>
                      <p className="text-xs text-muted-foreground">Commissions</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">
                        {formatAmount(vehicle.netEarnings)}
                      </p>
                      <p className="text-xs text-muted-foreground">Net</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      Driver: <span className="text-foreground">{vehicle.driverName}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Mate: <span className="text-foreground">{vehicle.mateName}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No vehicles registered</p>
                <p className="text-sm text-muted-foreground">
                  Add your first vehicle to start tracking earnings
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Commission Structure */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h4 className="font-medium text-foreground mb-3">Commission Structure</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Commission:</span>
                <span className="font-medium text-foreground">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mate Commission:</span>
                <span className="font-medium text-foreground">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee:</span>
                <span className="font-medium text-foreground">5%</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span className="text-foreground">Your Net:</span>
                <span className="text-purple-600">70%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => {
              toast({
                title: "Add Vehicle",
                description: "Vehicle registration feature coming soon!",
              });
            }}
          >
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Add Vehicle</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => {
              toast({
                title: "Manage Staff",
                description: "Staff management feature coming soon!",
              });
            }}
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Manage Staff</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-border bottom-nav-safe">
        <div className="flex">
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => {
              // Already on dashboard, just show feedback
              toast({
                title: "Dashboard",
                description: "You're already on the dashboard",
              });
            }}
          >
            <div className="text-center">
              <Building2 className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Dashboard</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/vehicles" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => {
              toast({
                title: "Vehicles",
                description: "Vehicle management page coming soon!",
              });
            }}
          >
            <div className="text-center">
              <Car className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Vehicles</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/reports" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => {
              toast({
                title: "Reports",
                description: "Financial reports page coming soon!",
              });
            }}
          >
            <div className="text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Reports</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/settings" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/settings")}
          >
            <div className="text-center">
              <Settings className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Settings</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}