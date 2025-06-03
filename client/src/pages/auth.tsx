
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Users, Bus, Building2, ArrowLeft, Upload } from "lucide-react";
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
    icon: Bus,
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
  const [ghanaCard, setGhanaCard] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"onboarding" | "signup" | "signin">("onboarding");
  const [userRole, setUserRole] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  // Check if user has completed onboarding
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const hasSignedUp = localStorage.getItem('hasSignedUp');
    
    if (hasSignedUp && savedRole) {
      setCurrentStep("signin");
      setUserRole(savedRole);
      setSelectedRole(savedRole);
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
      await login(phone.trim(), pin.trim());
      toast({
        title: "Welcome!",
        description: "Successfully logged in to TrotroPay",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid phone number or PIN",
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
        description: "Please fill in all required fields",
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          pin: pin.trim(),
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      
      // Store user data for UI state
      localStorage.setItem('hasSignedUp', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', selectedRole || '');
      
      // Auto-login the user after successful registration
      await login(phone.trim(), pin.trim());
      
      toast({
        title: "Account Created!",
        description: "Welcome to TrotroPay. You're now signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    setCurrentStep("signup");
  };

  const handleDemoLogin = (role: string) => {
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
      setUserRole(role);
      localStorage.setItem('userRole', role);
      localStorage.setItem('hasSignedUp', 'true');
      setCurrentStep("signin");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGhanaCard(file);
      toast({
        title: "Document Uploaded",
        description: "Ghana Card uploaded successfully",
      });
    }
  };

  const handleBackToOnboarding = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasSignedUp');
    setCurrentStep("onboarding");
    setUserRole(null);
    setSelectedRole(null);
    setPhone("");
    setPin("");
    setName("");
    setGhanaCard(null);
  };

  const handleBackToSignup = () => {
    setCurrentStep("signup");
    setPhone("");
    setPin("");
  };

  const handleExistingUser = () => {
    setCurrentStep("signin");
  };

  return (
    <div className="mobile-container">
      <div className="p-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Bus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">TrotroPay</h1>
          <p className="text-muted-foreground">Digital payments for Ghana's trotros</p>
        </div>

        {/* Step 1: Onboarding - Role Selection */}
        {currentStep === "onboarding" && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-center mb-2">Choose Your Role</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Select how you'll use TrotroPay</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
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

            {/* Demo Mode Section */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-sm font-medium text-center mb-4 text-muted-foreground">Quick Demo Access</h3>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Button
                      key={`demo-${role.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(role.id)}
                      className="flex items-center space-x-2 h-auto py-2"
                    >
                      <Icon className={`h-4 w-4 ${role.color}`} />
                      <span className="text-xs">{role.title}</span>
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Demo accounts with pre-filled credentials
              </p>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={handleExistingUser} className="text-sm">
                Already have an account? Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Sign Up - Create Account */}
        {currentStep === "signup" && selectedRole && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Create Your Account</h2>
                <p className="text-sm text-muted-foreground">
                  Registering as {roles.find(r => r.id === selectedRole)?.title}
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
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Phone Number (e.g., 0245678901)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-center"
                      required
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ghana Card (Optional for verification)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {ghanaCard && (
                      <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>
                    )}
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
                      onClick={handleExistingUser}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Sign In - Returning Users */}
        {currentStep === "signin" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                  {userRole ? `Signing in as ${roles.find(r => r.id === userRole)?.title}` : "Sign in to continue"}
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
            
            {userRole && (
              <Card className="border-primary bg-primary/5 mb-4">
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
            )}

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
                    Demo credentials: Phone: 0245678901, PIN: 1234
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    New to TrotroPay?{" "}
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={handleBackToOnboarding}
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
