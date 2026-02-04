import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteVehicleDialogProps {
  vehicle: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteVehicleDialog({ vehicle, onClose, onSuccess }: DeleteVehicleDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete vehicle");
      }

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete vehicle",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Vehicle
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to delete this vehicle?</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-3">
              <p className="font-semibold text-slate-900">{vehicle.vrm}</p>
              <p className="text-sm text-slate-600">{vehicle.make} {vehicle.model}</p>
              {vehicle.fleetNumber && (
                <p className="text-xs text-slate-500 mt-1">Fleet #{vehicle.fleetNumber}</p>
              )}
            </div>
            <p className="text-red-600 font-medium mt-3">
              ⚠️ This action cannot be undone. All associated inspection history and data will be permanently removed.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
