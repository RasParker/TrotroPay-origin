import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bus, 
  TrendingUp, 
  Users, 
  Bell, 
  LogOut, 
  DollarSign,
  BarChart3,
  Settings,
  Plus
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showCreateRouteDialog, setShowCreateRouteDialog] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteStart, setNewRouteStart] = useState("");
  const [newRouteEnd, setNewRouteEnd] = useState("");
  const [newRouteDistance, setNewRouteDistance] = useState("");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/driver/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch available routes
  const { data: routes } = useQuery({
    queryKey: ['/api/routes'],
    enabled: showRouteDialog,
  });

  // Route change mutation
  const routeChangeMutation = useMutation({
    mutationFn: async ({ vehicleId, routeId }: { vehicleId: string; routeId: number }) => {
      const response = await fetch(`/api/vehicles/${vehicleId}/route`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId }),
      });
      if (!response.ok) {
        throw new Error('Failed to update route');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/driver/${user?.id}`] });
      setShowRouteDialog(false);
      setSelectedRoute(null);
      const isInitialSelection = !dashboardData?.vehicle?.route;
      toast({
        title: isInitialSelection ? "Route Selected" : "Route Updated",
        description: `Successfully ${isInitialSelection ? 'selected' : 'changed to'} ${data.route.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Route Change Failed",
        description: error.message || "Failed to update route",
        variant: "destructive",
      });
    },
  });

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async (routeData: { name: string; startPoint: string; endPoint: string; distance: number }) => {
      return apiRequest("POST", "/api/routes", routeData);
    },
    onSuccess: () => {
      toast({
        title: "Route Created",
        description: "New route has been created successfully",
      });
      setShowCreateRouteDialog(false);
      setNewRouteName("");
      setNewRouteStart("");
      setNewRouteEnd("");
      setNewRouteDistance("");
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create route",
        variant: "destructive",
      });
    },
  });

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `GH₵ ${num.toFixed(2)}`;
  };

  const weekDays = [
    { day: "Mon", amount: "52.30" },
    { day: "Tue", amount: "48.70" },
    { day: "Wed", amount: "65.80" },
    { day: "Thu", amount: "0.00" },
    { day: "Fri", amount: "0.00" },
    { day: "Sat", amount: "0.00" },
    { day: "Sun", amount: "0.00" },
  ];

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
      <div className="gradient-accent text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium">Driver Dashboard</h2>
            <p className="text-blue-100 text-sm">
              Vehicle: {dashboardData?.vehicle?.vehicleId || "Not assigned"}
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
          <Card className="gradient-accent text-white mb-4">
            <CardContent className="p-4 text-center">
              <Bus className="h-8 w-8 mx-auto mb-2" />
              <h3 className="text-xl font-medium mb-1">
                {dashboardData.vehicle.vehicleId}
              </h3>
              <p className="text-blue-100">
                {dashboardData.vehicle.route}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Today's Performance */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-success text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <p className="text-green-100 text-sm">Gross Earnings</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.grossEarnings || "0")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-warning text-white">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2" />
              <p className="text-orange-100 text-sm">Your Share (15%)</p>
              <p className="text-2xl font-bold">
                {formatAmount(dashboardData?.driverShare || "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Route Management */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Route Management</h3>
                <p className="text-muted-foreground">
                  Manage your routes and create new ones
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateRouteDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Route
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowRouteDialog(true)}
                >
                  {dashboardData?.vehicle?.route ? "Change Route" : "Select Route"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Mate */}
        {dashboardData?.mate && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-3">Current Mate</h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {dashboardData.mate.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Collected: {formatAmount(dashboardData.grossEarnings || "0")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Commission (10%)</p>
                  <p className="font-medium text-foreground">
                    {formatAmount((parseFloat(dashboardData.grossEarnings || "0") * 0.1).toFixed(2))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-4">This Week</h3>
            <div className="space-y-3">
              {weekDays.map((day, index) => (
                <div 
                  key={day.day} 
                  className={`flex justify-between py-2 ${
                    index === 2 ? "bg-primary/10 px-3 rounded-lg" : ""
                  }`}
                >
                  <span className={`${index === 2 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {day.day}
                  </span>
                  <span className={`font-medium ${index === 2 ? "text-primary" : "text-foreground"}`}>
                    {formatAmount(day.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Weekly Total</span>
                  <span className="text-primary">
                    {formatAmount(weekDays.reduce((sum, day) => sum + parseFloat(day.amount), 0).toFixed(2))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-border bottom-nav-safe">
        <div className="flex">
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
          >
            <div className="text-center">
              <Bus className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Dashboard</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/fare-management" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/fare-management")}
          >
            <div className="text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Fares</span>
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 py-3 ${location === "/performance" ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
            onClick={() => setLocation("/performance")}
          >
            <div className="text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Performance</span>
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

      {/* Route Selection Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="!w-[80vw] !max-w-xs !mx-auto !p-4 sm:!max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {dashboardData?.vehicle?.route ? "Change Route" : "Select Route"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {dashboardData?.vehicle?.route 
                ? "Select a new route for your vehicle. This will update your assigned route immediately."
                : "Choose your operating route. This will set your vehicle's route for today."
              }
            </p>
            
            <div className="space-y-2">
              {routes?.map((route: any) => (
                <Button
                  key={route.id}
                  variant={selectedRoute?.id === route.id ? "default" : "outline"}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setSelectedRoute(route)}
                  disabled={routeChangeMutation.isPending}
                >
                  <div className="text-left">
                    <div className="font-medium">{route.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {route.startLocation} → {route.endLocation}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Distance: {route.distance}km
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {routes?.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No routes available
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRouteDialog(false);
                  setSelectedRoute(null);
                }}
                disabled={routeChangeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRoute && dashboardData?.vehicle?.vehicleId) {
                    routeChangeMutation.mutate({
                      vehicleId: dashboardData.vehicle.vehicleId,
                      routeId: selectedRoute.id
                    });
                  }
                }}
                disabled={!selectedRoute || routeChangeMutation.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Route Dialog */}
      <Dialog open={showCreateRouteDialog} onOpenChange={setShowCreateRouteDialog}>
        <DialogContent className="!w-[80vw] !max-w-xs !mx-auto !p-4 sm:!max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a new route that will be available for all drivers to select and manage.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  placeholder="e.g., Circle - Lapaz"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  disabled={createRouteMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startPoint">Start Point</Label>
                <Input
                  id="startPoint"
                  placeholder="e.g., Circle"
                  value={newRouteStart}
                  onChange={(e) => setNewRouteStart(e.target.value)}
                  disabled={createRouteMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endPoint">End Point</Label>
                <Input
                  id="endPoint"
                  placeholder="e.g., Lapaz"
                  value={newRouteEnd}
                  onChange={(e) => setNewRouteEnd(e.target.value)}
                  disabled={createRouteMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  placeholder="e.g., 12.5"
                  value={newRouteDistance}
                  onChange={(e) => setNewRouteDistance(e.target.value)}
                  disabled={createRouteMutation.isPending}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateRouteDialog(false);
                  setNewRouteName("");
                  setNewRouteStart("");
                  setNewRouteEnd("");
                  setNewRouteDistance("");
                }}
                disabled={createRouteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (newRouteName && newRouteStart && newRouteEnd && newRouteDistance) {
                    createRouteMutation.mutate({
                      name: newRouteName,
                      startPoint: newRouteStart,
                      endPoint: newRouteEnd,
                      distance: parseFloat(newRouteDistance)
                    });
                  }
                }}
                disabled={!newRouteName || !newRouteStart || !newRouteEnd || !newRouteDistance || createRouteMutation.isPending}
              >
                {createRouteMutation.isPending ? "Creating..." : "Create Route"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
