import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditVehicleDialogProps {
  vehicle: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditVehicleDialog({ vehicle, onClose, onSuccess }: EditVehicleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vrm: vehicle.vrm || "",
    make: vehicle.make || "",
    model: vehicle.model || "",
    fleetNumber: vehicle.fleetNumber || "",
    vehicleCategory: vehicle.vehicleCategory || "HGV",
    motDue: vehicle.motDue ? new Date(vehicle.motDue).toISOString().split('T')[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vrm || !formData.make || !formData.model) {
      toast({
        title: "Error",
        description: "VRM, make, and model are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          motDue: formData.motDue || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vehicle");
      }

      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update vehicle",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update vehicle information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vrm">VRM (Registration) *</Label>
            <Input
              id="vrm"
              value={formData.vrm}
              onChange={(e) => setFormData({ ...formData, vrm: e.target.value.toUpperCase() })}
              placeholder="e.g. AB12 CDE"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g. Volvo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. FH16"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fleetNumber">Fleet Number</Label>
              <Input
                id="fleetNumber"
                value={formData.fleetNumber}
                onChange={(e) => setFormData({ ...formData, fleetNumber: e.target.value })}
                placeholder="e.g. 001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleCategory">Category</Label>
              <Select
                value={formData.vehicleCategory}
                onValueChange={(value) => setFormData({ ...formData, vehicleCategory: value })}
              >
                <SelectTrigger id="vehicleCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HGV">HGV</SelectItem>
                  <SelectItem value="LGV">LGV</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Trailer">Trailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motDue">MOT Due Date</Label>
            <Input
              id="motDue"
              type="date"
              value={formData.motDue}
              onChange={(e) => setFormData({ ...formData, motDue: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
