import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, CreditCard, Shield, Edit2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  onBack: () => void;
}

export default function PassengerProfile({ onBack }: ProfilePageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");

  const handleSave = () => {
    // In a real app, you'd update the user data here
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const formatAmount = (amount: string) => `GH₵ ${parseFloat(amount).toFixed(2)}`;

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
              <h2 className="font-medium">Profile</h2>
              <p className="text-green-200 text-sm">Manage your account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-muted rounded-md">{user?.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center mt-1 p-2 bg-muted rounded-md">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{user?.phone}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="role">Account Type</Label>
              <p className="mt-1 p-2 bg-muted rounded-md capitalize">{user?.role}</p>
            </div>
          </CardContent>
        </Card>



        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change PIN
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Security Questions
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        {isEditing && (
          <div className="flex space-x-3">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditedName(user?.name || "");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}