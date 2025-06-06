import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, MapPin, Plus, Minus, Save, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface FareManagementProps {
  onBack: () => void;
}

export default function FareManagement({ onBack }: FareManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [fareInputs, setFareInputs] = useState<{ [stop: string]: string }>({});
  const [editingStops, setEditingStops] = useState(false);
  const [tempStops, setTempStops] = useState<string[]>([]);
  const [newStopName, setNewStopName] = useState("");

  // Get driver's assigned route
  const { data: driverData } = useQuery({
    queryKey: [`/api/dashboard/driver/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: routes } = useQuery({
    queryKey: ['/api/routes'],
  });

  const updateFaresMutation = useMutation({
    mutationFn: async ({ routeId, fares }: { routeId: number; fares: string[] }) => {
      return apiRequest('PUT', `/api/routes/${routeId}/fares`, { fares });
    },
    onSuccess: () => {
      toast({
        title: "Fares Updated",
        description: "Route fares have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setEditingRoute(null);
      setFareInputs({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update fares",
        variant: "destructive",
      });
    },
  });

  const updateStopsMutation = useMutation({
    mutationFn: async ({ routeId, stops }: { routeId: number; stops: string[] }) => {
      return apiRequest('PUT', `/api/routes/${routeId}/stops`, { stops });
    },
    onSuccess: () => {
      toast({
        title: "Stops Updated",
        description: "Route stops have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setEditingStops(false);
      setTempStops([]);
      setNewStopName("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update fares",
        variant: "destructive",
      });
    },
  });

  // Helper functions for stop management
  const handleEditStops = (route: any) => {
    setEditingStops(true);
    setTempStops([...route.stops]);
  };

  const handleAddStop = () => {
    if (newStopName.trim() && !tempStops.includes(newStopName.trim())) {
      setTempStops([...tempStops, newStopName.trim()]);
      setNewStopName("");
    }
  };

  const handleDeleteStop = (stopToDelete: string) => {
    if (tempStops.length > 2) { // Ensure at least 2 stops remain
      setTempStops(tempStops.filter(stop => stop !== stopToDelete));
    } else {
      toast({
        title: "Cannot Delete",
        description: "Route must have at least 2 stops",
        variant: "destructive",
      });
    }
  };

  const handleSaveStops = () => {
    if (currentRoute && tempStops.length >= 2) {
      updateStopsMutation.mutate({
        routeId: currentRoute.id,
        stops: tempStops
      });
    }
  };

  const moveStopUp = (index: number) => {
    if (index > 0) {
      const newStops = [...tempStops];
      [newStops[index], newStops[index - 1]] = [newStops[index - 1], newStops[index]];
      setTempStops(newStops);
    }
  };

  const moveStopDown = (index: number) => {
    if (index < tempStops.length - 1) {
      const newStops = [...tempStops];
      [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
      setTempStops(newStops);
    }
  };

  const currentRoute = driverData?.vehicle?.route 
    ? routes?.find((r: any) => r.name === driverData.vehicle.route)
    : null;

  const handleEditFares = (route: any) => {
    setEditingRoute(route);
    const inputs: { [stop: string]: string } = {};
    route.fares.forEach((fareStr: string) => {
      const [stop, fare] = fareStr.split(':');
      inputs[stop] = fare;
    });
    setFareInputs(inputs);
  };

  const handleFareChange = (stop: string, value: string) => {
    setFareInputs(prev => ({
      ...prev,
      [stop]: value
    }));
  };

  const handleSaveFares = () => {
    if (!editingRoute) return;

    const updatedFares = editingRoute.stops.map((stop: string) => {
      const fare = fareInputs[stop] || '0.00';
      return `${stop}:${fare}`;
    });

    updateFaresMutation.mutate({
      routeId: editingRoute.id,
      fares: updatedFares
    });
  };

  const formatAmount = (amount: string | number) => {
    return `GH₵ ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="gradient-primary text-white p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Fare Management</h1>
        </div>
        <p className="text-white/80 text-sm mt-2">
          Coordinate with station masters to update route fares
        </p>
      </div>

      <div className="p-4 pb-20">
        {/* Current Route Card */}
        {currentRoute ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Your Current Route</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">{currentRoute.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentRoute.startPoint} → {currentRoute.endPoint}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Fare Structure:</h4>
                  {currentRoute.stops.map((stop: string, index: number) => {
                    const fareStr = currentRoute.fares.find((f: string) => f.startsWith(stop));
                    const fare = fareStr ? fareStr.split(':')[1] : '0.00';
                    return (
                      <div key={stop} className="flex justify-between items-center py-1">
                        <span className="text-sm">{stop}</span>
                        <span className="font-medium">{formatAmount(fare)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={() => handleEditStops(currentRoute)}
                    variant="outline"
                    className="flex-1"
                    disabled={updateStopsMutation.isPending || editingRoute}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Stops
                  </Button>
                  <Button 
                    onClick={() => handleEditFares(currentRoute)}
                    className="flex-1"
                    disabled={updateFaresMutation.isPending || editingStops}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Fares (₵)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No Route Assigned</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You need to select a route before managing fares
              </p>
              <Button onClick={onBack} variant="outline">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fare Editing Modal */}
        {editingRoute && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Edit Fares - {editingRoute.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Coordinate with your station master before updating fares. 
                    Fares are cumulative - passengers pay based on distance traveled.
                  </p>
                </div>

                {editingRoute.stops.map((stop: string, index: number) => (
                  <div key={stop} className="space-y-2">
                    <Label htmlFor={`fare-${stop}`}>
                      {stop} {index === 0 ? "(Starting Point)" : `(Stop ${index})`}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">GH₵</span>
                      <Input
                        id={`fare-${stop}`}
                        type="number"
                        step="0.50"
                        min="0"
                        value={fareInputs[stop] || '0.00'}
                        onChange={(e) => handleFareChange(stop, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    {index > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Distance fare: GH₵ {(parseFloat(fareInputs[stop] || '0') - 
                        parseFloat(fareInputs[editingRoute.stops[index - 1]] || '0')).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSaveFares}
                    disabled={updateFaresMutation.isPending}
                    className="flex-1"
                  >
                    {updateFaresMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Fares
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingRoute(null);
                      setFareInputs({});
                    }}
                    disabled={updateFaresMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stop Management Interface */}
        {editingStops && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Manage Route Stops</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Coordinate with station masters and vehicle owners before making route changes. Route must have at least 2 stops.
                  </p>
                </div>

                {/* Current Stops */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Stops:</Label>
                  {tempStops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm">{stop}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Move Up Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStopUp(index)}
                          disabled={index === 0}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        {/* Move Down Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStopDown(index)}
                          disabled={index === tempStops.length - 1}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStop(stop)}
                          disabled={tempStops.length <= 2}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Stop */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Add New Stop:</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter stop name..."
                      value={newStopName}
                      onChange={(e) => setNewStopName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStop()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddStop}
                      disabled={!newStopName.trim() || tempStops.includes(newStopName.trim())}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {newStopName.trim() && tempStops.includes(newStopName.trim()) && (
                    <p className="text-xs text-red-600">Stop already exists</p>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSaveStops}
                    disabled={updateStopsMutation.isPending || tempStops.length < 2}
                    className="flex-1"
                  >
                    {updateStopsMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Stops
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingStops(false);
                      setTempStops([]);
                      setNewStopName("");
                    }}
                    disabled={updateStopsMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Fare Management Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Always coordinate with your station master before changing fares</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Fares are cumulative - passengers pay based on distance traveled</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Starting point should always be GH₵ 0.00</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Consider fuel costs and distance when setting fares</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Updated fares take effect immediately for new passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}