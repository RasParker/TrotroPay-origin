import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Users, Car, Building2, ArrowLeft } from "lucide-react";
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
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  // Check if user has completed onboarding
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const hasSignedUp = localStorage.getItem('hasSignedUp');
    
    if (hasSignedUp && savedRole) {
      setIsOnboarding(false);
      setUserRole(savedRole);
      setSelectedRole(savedRole);
    } else if (!hasSignedUp) {
      setShowSignup(true);
    }
  }, []);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !pin.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate signup - in real app would create user account
      localStorage.setItem('hasSignedUp', 'true');
      localStorage.setItem('userName', name);
      setShowSignup(false);
      setIsOnboarding(true);
      
      toast({
        title: "Account Created!",
        description: "Welcome to TrotroPay. Please select your role to continue.",
      });
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setIsOnboarding(false);
    
    // Auto-fill test credentials for demo
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
    }
  };

  const handleBackToOnboarding = () => {
    localStorage.removeItem('userRole');
    setIsOnboarding(true);
    setUserRole(null);
    setSelectedRole(null);
    setPhone("");
    setPin("");
  };

  const handleBackToSignup = () => {
    localStorage.removeItem('hasSignedUp');
    localStorage.removeItem('userRole');
    setShowSignup(true);
    setIsOnboarding(true);
    setUserRole(null);
    setSelectedRole(null);
    setPhone("");
    setPin("");
    setName("");
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

        {/* Signup Screen for First-Time Users */}
        {showSignup && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-center mb-2">Create Your Account</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Join TrotroPay and revolutionize your transport payments</p>
            
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-center"
                    />
                  </div>
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
                      placeholder="Create 4-digit PIN"
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
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => {
                        setShowSignup(false);
                        setIsOnboarding(true);
                      }}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onboarding - Role Selection for New Users */}
        {isOnboarding && !showSignup && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Choose Your Role</h2>
                <p className="text-sm text-muted-foreground">Select how you'll use TrotroPay</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSignup}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card 
                    key={role.id}
                    className="cursor-pointer transition-all border-2 border-border hover:border-primary/50"
                    onClick={() => handleRoleSelection(role.id)}
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
        )}

        {/* Returning User - Role-Specific Login */}
        {!isOnboarding && userRole && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                  Signing in as {roles.find(r => r.id === userRole)?.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToOnboarding}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4 text-center">
                {(() => {
                  const currentRole = roles.find(r => r.id === userRole);
                  const Icon = currentRole?.icon || User;
                  return (
                    <>
                      <div className={`inline-flex p-3 rounded-lg bg-background/50 mb-3 ${currentRole?.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{currentRole?.title}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{currentRole?.description}</p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Login Form - Only show after role selection */}
        {!isOnboarding && selectedRole && (
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

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Demo credentials filled for {selectedRole}. Click "Sign In" to continue.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
