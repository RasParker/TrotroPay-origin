import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface NotificationsPageProps {
  onBack: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { user } = useAuth();

  // Mock notifications - in a real app, this would come from an API
  const notifications = [
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      message: "GH₵ 3.50 received from passenger for Lapaz trip",
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Route Update",
      message: "Your assigned route has been updated to Circle - Lapaz",
      time: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
    {
      id: 3,
      type: "warning",
      title: "Vehicle Maintenance",
      message: "GT-1234-20 is due for maintenance check",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: 4,
      type: "success",
      title: "Daily Target Reached",
      message: "Congratulations! You've reached your daily collection target",
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
  ];

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