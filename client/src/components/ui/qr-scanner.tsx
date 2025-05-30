import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, X, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleMockScan = () => {
    // Mock QR code scan result
    onScan("GT-1234-20");
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white bg-black/50 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="text-white text-center">
            <h3 className="font-medium">Scan QR Code</h3>
            <p className="text-sm opacity-75">Point camera at trotro QR code</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Camera View */}
        <div className="h-full flex items-center justify-center relative">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 qr-scanner-overlay">
                <div className="flex items-center justify-center h-full">
                  <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg relative">
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-white"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-white"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-white"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-white"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Initializing camera...</p>
            </div>
          )}
        </div>

        {/* Mock Scan Button (for development) */}
        <div className="absolute bottom-8 left-4 right-4">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                For demo purposes, click below to simulate QR scan
              </p>
              <Button onClick={handleMockScan} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Simulate QR Scan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
