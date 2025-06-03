import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FareCalculatorProps {
  onBack: () => void;
}

export default function FareCalculator({ onBack }: FareCalculatorProps) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [boardingStop, setBoardingStop] = useState("");
  const [alightingStop, setAlightingStop] = useState("");
  const [fareResult, setFareResult] = useState<any>(null);
  const { toast } = useToast();

  const { data: routes } = useQuery({
    queryKey: ['/api/routes'],
  });

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
      console.log('Fare calculation result:', data);
      console.log('Data type:', typeof data);
      console.log('Data properties:', Object.keys(data || {}));
      try {
        if (data && typeof data === 'object') {
          console.log('Setting fare result with data:', JSON.stringify(data));
          setFareResult(data);
          console.log('Fare result set successfully');
        } else {
          console.error('Invalid response format - data is not an object');
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error setting fare result:', error);
        toast({
          title: "Display Error",
          description: "Failed to display fare calculation",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate fare",
        variant: "destructive",
      });
    },
  });

  const selectedRouteData = routes && Array.isArray(routes) ? routes.find((r: any) => r.id === parseInt(selectedRoute)) : null;
  
  // Get valid alighting stops based on boarding stop
  const getValidAlightingStops = () => {
    if (!selectedRouteData || !boardingStop) return [];
    const boardingIndex = selectedRouteData.stops.indexOf(boardingStop);
    return selectedRouteData.stops.slice(boardingIndex + 1);
  };

  const handleCalculate = () => {
    if (selectedRoute && boardingStop && alightingStop) {
      fareCalculationMutation.mutate({
        routeId: parseInt(selectedRoute),
        boardingStop,
        alightingStop
      });
    }
  };

  // Reset dependent fields when selections change
  useEffect(() => {
    setBoardingStop("");
    setAlightingStop("");
    setFareResult(null);
  }, [selectedRoute]);

  useEffect(() => {
    setAlightingStop("");
    setFareResult(null);
  }, [boardingStop]);

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
          <h1 className="text-xl font-semibold">Fare Calculator</h1>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Route Selection */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Calculate Your Fare</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Route</label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route" />
                </SelectTrigger>
                <SelectContent>
                  {routes && Array.isArray(routes) && routes.map((route: any) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRouteData && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Boarding Stop</label>
                  <Select value={boardingStop} onValueChange={setBoardingStop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Where are you boarding?" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedRouteData.stops.slice(0, -1).map((stop: string) => (
                        <SelectItem key={stop} value={stop}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{stop}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {boardingStop && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Alighting Stop</label>
                    <Select value={alightingStop} onValueChange={setAlightingStop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Where are you alighting?" />
                      </SelectTrigger>
                      <SelectContent>
                        {getValidAlightingStops().map((stop: string) => (
                          <SelectItem key={stop} value={stop}>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{stop}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {boardingStop && alightingStop && (
              <Button 
                onClick={handleCalculate}
                disabled={fareCalculationMutation.isPending}
                className="w-full"
              >
                {fareCalculationMutation.isPending ? "Calculating..." : "Calculate Fare"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Fare Result */}
        {fareResult && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-green-600">Fare Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Journey</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>{fareResult.boardingStop || 'N/A'}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{fareResult.alightingStop || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="text-sm">{fareResult.distance || 0} stops</span>
                </div>
                
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Fare Amount</span>
                  <span className="text-green-600">GH₵ {Number(fareResult.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Information */}
        {selectedRouteData && (
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">{selectedRouteData.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedRouteData.startPoint} → {selectedRouteData.endPoint}
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">All Stops:</p>
                  <div className="text-sm text-muted-foreground">
                    {selectedRouteData.stops.join(" → ")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}