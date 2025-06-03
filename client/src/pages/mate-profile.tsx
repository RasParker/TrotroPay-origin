import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface MateProfileProps {
  onBack: () => void;
}

export default function MateProfile({ onBack }: MateProfileProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: "Accra, Ghana"
  });

  const handleSave = () => {
    // In a real app, this would make an API call to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      location: "Accra, Ghana"
    });
    setIsEditing(false);
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="gradient-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white hover:bg-white/20"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{formData.name || "Not set"}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{formData.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{formData.location}</p>
              )}
            </div>

            <div>
              <Label>Role</Label>
              <p className="mt-1 p-2 bg-green-50 rounded-md text-green-700 font-medium">
                Mate (Conductor)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-3 mb-6">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        )}

        {/* Account Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Phone className="h-4 w-4 mr-3" />
              Change Phone Number
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-3" />
              Update Location
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={logout}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}