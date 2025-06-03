import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Users, Car, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const roles = [
  {
    id: "passenger",
    title: "Passenger",
    description: "Pay for your trotro journey",
    icon: User,
    color: "text-blue-600",
  },
  {
    id: "mate",
    title: "Mate",
    description: "Collect payments from passengers",
    icon: Users,
    color: "text-green-600",
  },
  {
    id: "driver",
    title: "Driver", 
    description: "Track your vehicle earnings",
    icon: Car,
    color: "text-orange-600",
  },
  {
    id: "owner",
    title: "Car Owner",
    description: "Manage your fleet",
    icon: Building2,
    color: "text-purple-600",
  },
];

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !pin) {
      toast({
        title: "Error",
        description: "Please enter both phone number and PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(phone, pin);
      toast({
        title: "Welcome!",
        description: "Successfully logged in to TrotroPay",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid phone number or PIN",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock login with predefined test accounts
  const handleMockLogin = (role: string) => {
    const mockAccounts = {
      passenger: { phone: "0245678901", pin: "1234" },
      mate: { phone: "0234567890", pin: "1234" },
      driver: { phone: "0223456789", pin: "1234" },
      owner: { phone: "0212345678", pin: "1234" },
    };

    const account = mockAccounts[role as keyof typeof mockAccounts];
    if (account) {
      setPhone(account.phone);
      setPin(account.pin);
      setSelectedRole(role);
    }
  };

  return (
    <div className="mobile-container">
      <div className="p-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Car className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">TrotroPay</h1>
          <p className="text-muted-foreground">Digital payments for Ghana's trotros</p>
        </div>

        {/* Role Selection - 2x2 Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-center mb-2">Welcome Back</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Choose your role and sign in to continue</p>
          
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedRole === role.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleMockLogin(role.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-3 rounded-lg bg-background/50 mb-3 ${role.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{role.title}</h3>
                    <p className="text-xs text-muted-foreground leading-tight">{role.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <Card className="flex-1">
          <CardHeader>
            <h3 className="text-lg font-medium text-center">Sign In</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number (e.g., 0245678901)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-center"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="PIN (e.g., 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {selectedRole && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Demo credentials filled for {selectedRole}. Click "Sign In" to continue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
