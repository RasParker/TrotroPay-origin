import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, QrCode, Download, Share2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  onBack: () => void;
}

export default function QRCodeDisplay({ onBack }: QRCodeDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Get user's vehicle info first
  const { data: dashboardData } = useQuery({
    queryKey: [`/api/dashboard/mate/${user?.id}`],
    enabled: !!user?.id && user.role === "mate",
  });

  // Get QR code once we have vehicle ID
  const { data: qrData, isLoading } = useQuery({
    queryKey: [`/api/qr-code/${vehicleId}`, refreshKey],
    enabled: !!vehicleId,
    staleTime: 0,
  });

  useEffect(() => {
    if (dashboardData?.vehicle?.vehicleId) {
      setVehicleId(dashboardData.vehicle.vehicleId);
    }
  }, [dashboardData]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "QR Code Refreshed",
      description: "Generated a new QR code for payments",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TrotroPay QR Code',
        text: 'Scan this QR code to pay for your trotro fare',
        url: window.location.href,
      });
    } else {
      toast({
        title: "QR Code Ready",
        description: "Show this QR code to passengers for payment",
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "QR code image has been saved to your device",
    });
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-success text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium">Payment QR Code</h2>
            <p className="text-green-200 text-sm">For passenger payments</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* QR Code Display */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
                </div>
              ) : qrData?.qrCodeUrl ? (
                <img 
                  src={qrData.qrCodeUrl} 
                  alt="Payment QR Code"
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">QR Code Unavailable</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-foreground mb-2">
              Scan to Pay Fare
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Passengers can scan this code to pay their trotro fare
            </p>
            
            <div className="bg-muted p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-foreground">Vehicle ID</p>
              <p className="text-lg font-bold text-primary">{vehicleId || "Loading..."}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="mb-4"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button onClick={handleShare} variant="outline" className="h-12">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload} variant="outline" className="h-12">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-foreground mb-3">How to use:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <p>Show this QR code to passengers</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <p>Passengers scan with their TrotroPay app</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <p>Payment notifications appear instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}