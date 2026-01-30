import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, TrendingUp, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);

  const companyId = 1; // TODO: Get from auth context

  const generateReport = async (reportType: string, endpoint: string) => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error('Start date must be before end date');
      return;
    }

    setGenerating(reportType);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${reportType} generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const reports = [
    {
      id: 'dvsa-compliance',
      title: 'DVSA Compliance Report',
      description: 'Complete compliance report for DVSA audits including all inspections, defects, and vehicle summaries',
      icon: Shield,
      endpoint: '/api/reports/dvsa-compliance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'fleet-utilization',
      title: 'Fleet Utilization Report',
      description: 'Analyze vehicle usage, hours worked, and fleet efficiency metrics',
      icon: TrendingUp,
      endpoint: '/api/reports/fleet-utilization',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'driver-performance',
      title: 'Driver Performance Report',
      description: 'Comprehensive driver statistics including inspections, defects reported, and hours worked',
      icon: Users,
      endpoint: '/api/reports/driver-performance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate compliance and performance reports</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Period
          </CardTitle>
          <CardDescription>Select the date range for your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Quick Date Ranges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setMonth(start.getMonth() - 3);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
            >
              Last 3 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setMonth(start.getMonth() - 6);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
            >
              Last 6 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setFullYear(start.getFullYear() - 1);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
            >
              Last Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;

          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => generateReport(report.id, report.endpoint)}
                  disabled={isGenerating || !startDate || !endDate}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">DVSA Compliance Report</h3>
            <p className="text-sm text-gray-600">
              Comprehensive report for DVSA audits including:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
              <li>Total inspections and vehicles</li>
              <li>Defect breakdown by severity and status</li>
              <li>Vehicle-by-vehicle inspection summary</li>
              <li>Compliance metrics and inspection rates</li>
              <li>15-month retention confirmation</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Fleet Utilization Report</h3>
            <p className="text-sm text-gray-600">
              Analyze fleet efficiency with:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
              <li>Total hours worked per vehicle</li>
              <li>Number of shifts per vehicle</li>
              <li>Average utilization rates</li>
              <li>Idle vehicle identification</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Driver Performance Report</h3>
            <p className="text-sm text-gray-600">
              Track driver performance including:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
              <li>Inspections completed per driver</li>
              <li>Defects reported per driver</li>
              <li>Total hours worked and shifts</li>
              <li>Performance comparison across drivers</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> All reports are generated in PDF format and include your company branding. 
              Reports are suitable for DVSA audits and internal performance reviews.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
