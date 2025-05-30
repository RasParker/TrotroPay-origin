import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface HistoryPageProps {
  onBack: () => void;
}

export default function PassengerHistory({ onBack }: HistoryPageProps) {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/transactions/user/${user?.id}`],
    enabled: !!user?.id,
  });

  const formatAmount = (amount: string) => `GH₵ ${parseFloat(amount).toFixed(2)}`;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-GB");
    }
  };

  const groupByDate = (transactions: any[]) => {
    const groups: Record<string, any[]> = {};
    transactions.forEach(transaction => {
      const date = formatDate(transaction.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
    });
    return groups;
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedTransactions = transactions && Array.isArray(transactions) ? groupByDate(transactions) : {};

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium">Trip History</h2>
            <p className="text-green-200 text-sm">All your journeys</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <History className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-2xl font-bold text-foreground">
                {(transactions && Array.isArray(transactions)) ? transactions.length : 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">
                {formatAmount(
                  (transactions && Array.isArray(transactions)) 
                    ? transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0).toFixed(2) 
                    : "0"
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {date}
                </h3>
                <div className="space-y-2">
                  {dayTransactions.map((transaction: any) => (
                    <Card key={transaction.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-3 h-3 bg-success rounded-full"></div>
                              <span className="font-medium text-foreground">
                                {transaction.route}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              → {transaction.destination}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(transaction.createdAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              {formatAmount(transaction.amount)}
                            </p>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-success">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No trips yet</p>
                <p className="text-sm text-muted-foreground">
                  Your journey history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}