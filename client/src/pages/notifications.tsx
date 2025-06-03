import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Clock, CheckCircle, AlertCircle, Info, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface NotificationsPageProps {
  onBack: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { user } = useAuth();

  // Create role-specific notifications
  const getNotificationsForRole = (userRole: string) => {
    if (userRole === "owner") {
      return [
        {
          id: 1,
          title: "Daily Revenue Summary",
          message: "Total fleet earnings: GH₵ 285.50 from 3 vehicles",
          time: "30 minutes ago", 
          type: "success" as const,
          icon: <CheckCircle className="h-5 w-5" />,
        },
        {
          id: 2,
          title: "Vehicle Maintenance Due",
          message: "GR-1234-20 needs service in 2 days",
          time: "2 hours ago",
          type: "warning" as const,
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          id: 3,
          title: "Low Performance Alert",
          message: "Vehicle GR-5678-21 earnings down 15% this week",
          time: "4 hours ago",
          type: "warning" as const,
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          id: 4,
          title: "Driver Commission Paid",
          message: "Kwame Asante - GH₵ 42.75 commission transferred",
          time: "6 hours ago",
          type: "info" as const,
          icon: <Info className="h-5 w-5" />,
        },
        {
          id: 5,
          title: "New Driver Application",
          message: "John Mensah applied to drive vehicle GR-9876-22",
          time: "1 day ago",
          type: "info" as const,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          id: 6,
          title: "Insurance Renewal",
          message: "Vehicle GR-1234-20 insurance expires in 15 days",
          time: "2 days ago",
          type: "warning" as const,
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ];
    } else if (userRole === "driver") {
      return [
        {
          id: 1,
          title: "Daily Earnings",
          message: "You earned GH₵ 45.30 today (15% commission)",
          time: "1 hour ago",
          type: "success" as const,
          icon: <CheckCircle className="h-5 w-5" />,
        },
        {
          id: 2,
          title: "Route Update",
          message: "New stops added to Accra-Kumasi route",
          time: "3 hours ago",
          type: "info" as const,
          icon: <Info className="h-5 w-5" />,
        },
        {
          id: 3,
          title: "Vehicle Check Required",
          message: "Please inspect vehicle before starting today",
          time: "1 day ago",
          type: "warning" as const,
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ];
    } else if (userRole === "mate") {
      return [
        {
          id: 1,
          title: "Payment Received",
          message: "GH₵ 2.50 received from passenger",
          time: "2 minutes ago",
          type: "success" as const,
          icon: <CheckCircle className="h-5 w-5" />,
        },
        {
          id: 2,
          title: "Daily Commission",
          message: "You earned GH₵ 28.50 today (10% commission)",
          time: "1 hour ago",
          type: "success" as const,
          icon: <CheckCircle className="h-5 w-5" />,
        },
        {
          id: 3,
          title: "Route Update",
          message: "New stops added to current route",
          time: "4 hours ago",
          type: "info" as const,
          icon: <Info className="h-5 w-5" />,
        },
      ];
    } else {
      // Passenger notifications
      return [
        {
          id: 1,
          title: "Payment Successful",
          message: "GH₵ 2.50 paid for Accra-Tema trip",
          time: "10 minutes ago",
          type: "success" as const,
          icon: <CheckCircle className="h-5 w-5" />,
        },
        {
          id: 2,
          title: "Low Balance Alert",
          message: "Your wallet balance is below GH₵ 5.00",
          time: "2 hours ago",
          type: "warning" as const,
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          id: 3,
          title: "Trip History Updated",
          message: "Your recent trip details are now available",
          time: "1 day ago",
          type: "info" as const,
          icon: <FileText className="h-5 w-5" />,
        },
      ];
    }
  };

  const notifications = getNotificationsForRole(user?.role || "passenger");

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-medium">Notifications</h2>
              <p className="text-green-200 text-sm">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="h-12">
            Mark All Read
          </Button>
          <Button variant="outline" className="h-12">
            Clear All
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border transition-colors ${
                !notification.read ? "border-primary bg-blue-50" : "border-border"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${!notification.read ? "text-primary" : "text-foreground"}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary" className="ml-2 bg-primary text-white">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(notification.time)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}