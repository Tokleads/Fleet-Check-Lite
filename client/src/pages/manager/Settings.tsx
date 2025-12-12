import { ManagerLayout } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBrand } from "@/hooks/use-brand";
import { Palette, HardDrive, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { currentCompany } = useBrand();
  const [primaryColor, setPrimaryColor] = useState(currentCompany.settings.brand?.primaryColor || "#2563eb");
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper to update CSS variable locally to preview
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPrimaryColor(color);
    // In a real app we'd convert hex to HSL and apply to :root
    // For this prototype we can just visualize it in the picker
  };

  return (
    <ManagerLayout>
      <div className="p-8 space-y-8 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold text-slate-900">Company Settings</h1>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" /> Brand Kit
                </CardTitle>
                <CardDescription>Customize the look and feel of your driver app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input defaultValue={currentCompany.name} />
                    </div>
                    <div className="space-y-2">
                        <Label>Primary Brand Color</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="color" 
                                value={primaryColor} 
                                onChange={handleColorChange}
                                className="w-12 h-10 p-1" 
                            />
                            <Input 
                                value={primaryColor} 
                                onChange={handleColorChange} 
                                className="font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                    <Label className="mb-2 block text-xs uppercase tracking-wider text-slate-500">Preview Button Style</Label>
                    <div className="flex gap-4">
                        <Button style={{ backgroundColor: primaryColor }}>Primary Action</Button>
                        <Button variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>Secondary Action</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" /> Storage Integration
                </CardTitle>
                <CardDescription>Bring Your Own Storage (Google Drive) for photos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020-present%29.svg" alt="Drive" className="h-8 w-8" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Google Drive</h4>
                            <p className="text-sm text-slate-500">
                                {currentCompany.googleDriveConnected ? 'Connected to company drive' : 'Not connected'}
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        variant={currentCompany.googleDriveConnected ? "outline" : "default"}
                        onClick={() => setIsConnecting(!isConnecting)}
                    >
                        {currentCompany.googleDriveConnected ? "Reconnect" : "Connect Drive"}
                    </Button>
                </div>

                {currentCompany.googleDriveConnected && (
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2">
                        <div className="flex justify-between">
                            <span>Status</span>
                            <span className="text-green-600 font-bold flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Target Folder</span>
                            <span className="font-mono">/FleetCheck/Uploads</span>
                        </div>
                        <div className="pt-2">
                            <Button size="sm" variant="ghost" className="h-auto p-0 text-primary hover:text-primary/80">
                                <RefreshCw className="h-3 w-3 mr-1" /> Test Upload Connection
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
