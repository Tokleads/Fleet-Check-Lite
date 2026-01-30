import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wrench, Clock, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Defect = {
  id: number;
  vehicleVrm: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  reportedBy: string;
  createdAt: string;
  rectification?: Rectification;
};

type Rectification = {
  id: number;
  status: string;
  workDescription: string;
  startedAt: string;
  completedAt?: string;
  hoursWorked?: number;
  partsUsed: Part[];
  totalPartsCost: number;
  labourCost: number;
};

type Part = {
  partNumber: string;
  description: string;
  quantity: number;
  cost: number;
};

export default function MechanicDashboard() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Rectification form state
  const [workDescription, setWorkDescription] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [labourCost, setLabourCost] = useState('');
  const [partsUsed, setPartsUsed] = useState<Part[]>([]);
  const [newPart, setNewPart] = useState<Part>({
    partNumber: '',
    description: '',
    quantity: 1,
    cost: 0,
  });

  useEffect(() => {
    fetchAssignedDefects();
  }, []);

  const fetchAssignedDefects = async () => {
    try {
      setLoading(true);
      const mechanicId = localStorage.getItem('userId');
      const response = await fetch(`/api/defects/assigned/${mechanicId}`);
      if (response.ok) {
        const data = await response.json();
        setDefects(data);
      }
    } catch (error) {
      toast.error('Failed to load assigned defects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (defect: Defect) => {
    setSelectedDefect(defect);
    setWorkDescription('');
    setHoursWorked('');
    setLabourCost('');
    setPartsUsed([]);
    setIsWorkDialogOpen(true);
  };

  const handleAddPart = () => {
    if (!newPart.partNumber || !newPart.description) {
      toast.error('Please fill in part number and description');
      return;
    }
    setPartsUsed([...partsUsed, newPart]);
    setNewPart({ partNumber: '', description: '', quantity: 1, cost: 0 });
  };

  const handleRemovePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const handleCompleteWork = async () => {
    if (!selectedDefect || !workDescription) {
      toast.error('Please provide work description');
      return;
    }

    try {
      setLoading(true);
      const mechanicId = localStorage.getItem('userId');
      const totalPartsCost = partsUsed.reduce((sum, part) => sum + (part.cost * part.quantity), 0);

      const response = await fetch('/api/rectifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defectId: selectedDefect.id,
          mechanicId: Number(mechanicId),
          workDescription,
          hoursWorked: parseFloat(hoursWorked) || 0,
          partsUsed,
          totalPartsCost: Math.round(totalPartsCost * 100), // Convert to pence
          labourCost: Math.round(parseFloat(labourCost || '0') * 100),
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Work completed successfully');
        setIsWorkDialogOpen(false);
        fetchAssignedDefects();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to complete work');
      }
    } catch (error) {
      toast.error('Failed to complete work');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge variant="secondary">Assigned</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'RECTIFIED':
        return <Badge className="bg-green-500">Rectified</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const stats = {
    assigned: defects.filter(d => d.status === 'ASSIGNED').length,
    inProgress: defects.filter(d => d.status === 'IN_PROGRESS').length,
    completed: defects.filter(d => d.status === 'RECTIFIED').length,
    total: defects.length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mechanic Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage assigned defects and repairs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Defects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Defects</CardTitle>
          <CardDescription>Defects assigned to you for rectification</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No defects assigned
                  </TableCell>
                </TableRow>
              ) : (
                defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell className="font-medium">{defect.vehicleVrm}</TableCell>
                    <TableCell>{defect.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{defect.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(defect.severity)}`} />
                        {defect.severity}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(defect.status)}</TableCell>
                    <TableCell>
                      {new Date(defect.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {defect.status === 'ASSIGNED' || defect.status === 'IN_PROGRESS' ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartWork(defect)}
                          className="flex items-center gap-2"
                        >
                          <Wrench className="w-4 h-4" />
                          {defect.status === 'ASSIGNED' ? 'Start Work' : 'Complete Work'}
                        </Button>
                      ) : (
                        <Badge variant="outline">Completed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Work Dialog */}
      <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Rectification Work</DialogTitle>
            <DialogDescription>
              Record work details, parts used, and costs for {selectedDefect?.vehicleVrm}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Work Description */}
            <div>
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe the work performed..."
                rows={3}
              />
            </div>

            {/* Time and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoursWorked">Hours Worked</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  placeholder="2.5"
                />
              </div>
              <div>
                <Label htmlFor="labourCost">Labour Cost (£)</Label>
                <Input
                  id="labourCost"
                  type="number"
                  step="0.01"
                  value={labourCost}
                  onChange={(e) => setLabourCost(e.target.value)}
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Parts Used */}
            <div>
              <Label>Parts Used</Label>
              <div className="border rounded-lg p-4 space-y-3">
                {partsUsed.map((part, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{part.partNumber}</div>
                      <div className="text-sm text-gray-600">{part.description}</div>
                    </div>
                    <div className="text-sm">Qty: {part.quantity}</div>
                    <div className="text-sm font-medium">£{(part.cost * part.quantity).toFixed(2)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePart(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {/* Add Part Form */}
                <div className="grid grid-cols-5 gap-2 pt-2 border-t">
                  <Input
                    placeholder="Part #"
                    value={newPart.partNumber}
                    onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    className="col-span-2"
                    value={newPart.description}
                    onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                  />
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Cost"
                      value={newPart.cost}
                      onChange={(e) => setNewPart({ ...newPart, cost: parseFloat(e.target.value) || 0 })}
                    />
                    <Button onClick={handleAddPart} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                {partsUsed.length > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t font-medium">
                    <span>Total Parts Cost:</span>
                    <span>£{partsUsed.reduce((sum, part) => sum + (part.cost * part.quantity), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteWork} disabled={loading || !workDescription}>
              {loading ? 'Saving...' : 'Complete Work'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
