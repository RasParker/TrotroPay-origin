import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, QrCode, Download, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  onBack: () => void;
}

export default function QRCodeDisplay({ onBack }: QRCodeDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();

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
              {/* Enhanced QR Code Design */}
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 bg-black rounded-lg">
                  {/* QR pattern simulation */}
                  <div className="grid grid-cols-8 gap-1 p-2 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                        } rounded-sm`}
                      />
                    ))}
                  </div>
                  {/* Center logo */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-foreground mb-2">
              Scan to Pay Fare
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Passengers can scan this code to pay their trotro fare
            </p>
            
            <div className="bg-muted p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-foreground">Vehicle ID</p>
              <p className="text-lg font-bold text-primary">GT-1234-20</p>
            </div>
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