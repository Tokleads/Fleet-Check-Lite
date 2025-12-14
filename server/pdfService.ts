import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface InspectionData {
  id: number;
  companyName: string;
  vehicleVrm: string;
  vehicleMake: string;
  vehicleModel: string;
  driverName: string;
  type: string;
  status: string;
  odometer: number;
  checklist: any[];
  defects: any[] | null;
  hasTrailer: boolean;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

export function generateInspectionPDF(inspection: InspectionData): PassThrough {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = new PassThrough();
  doc.pipe(stream);

  const createdDate = new Date(inspection.createdAt);
  const dateStr = createdDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = createdDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.fontSize(20).font('Helvetica-Bold').text('Vehicle Inspection Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated: ${dateStr} at ${timeStr}`, { align: 'center' });
  doc.moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#dddddd');
  doc.moveDown(1);

  doc.fillColor('#000000');
  doc.fontSize(12).font('Helvetica-Bold').text('Company: ', { continued: true }).font('Helvetica').text(inspection.companyName);
  doc.fontSize(12).font('Helvetica-Bold').text('Vehicle: ', { continued: true }).font('Helvetica').text(`${inspection.vehicleVrm} - ${inspection.vehicleMake} ${inspection.vehicleModel}`);
  doc.fontSize(12).font('Helvetica-Bold').text('Driver: ', { continued: true }).font('Helvetica').text(inspection.driverName);
  doc.fontSize(12).font('Helvetica-Bold').text('Check Type: ', { continued: true }).font('Helvetica').text(inspection.type.replace('_', ' '));
  doc.fontSize(12).font('Helvetica-Bold').text('Odometer: ', { continued: true }).font('Helvetica').text(inspection.odometer != null ? `${inspection.odometer.toLocaleString()} miles` : 'N/A');
  doc.fontSize(12).font('Helvetica-Bold').text('Trailer Coupled: ', { continued: true }).font('Helvetica').text(inspection.hasTrailer ? 'Yes' : 'No');
  doc.moveDown(0.5);

  if (inspection.startedAt && inspection.completedAt) {
    const startTime = new Date(inspection.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(inspection.completedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const duration = inspection.durationSeconds ? `${Math.floor(inspection.durationSeconds / 60)}m ${inspection.durationSeconds % 60}s` : 'N/A';
    
    doc.fontSize(12).font('Helvetica-Bold').text('DVSA Timing Evidence', { underline: true });
    doc.fontSize(11).font('Helvetica').text(`Started: ${startTime} | Completed: ${endTime} | Duration: ${duration}`);
    doc.moveDown(0.5);
  }

  const statusColor = inspection.status === 'PASS' ? '#16a34a' : '#dc2626';
  doc.fontSize(14).font('Helvetica-Bold').fillColor(statusColor).text(`Result: ${inspection.status}`, { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#dddddd');
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Checklist Items');
  doc.moveDown(0.5);

  if (Array.isArray(inspection.checklist)) {
    let currentSection = '';
    inspection.checklist.forEach((item: any) => {
      if (item.section !== currentSection) {
        currentSection = item.section;
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151').text(currentSection);
        doc.fillColor('#000000');
      }

      const statusIcon = item.status === 'pass' ? '[PASS]' : item.status === 'fail' ? '[FAIL]' : item.status === 'na' ? '[N/A]' : '[--]';
      const statusClr = item.status === 'pass' ? '#16a34a' : item.status === 'fail' ? '#dc2626' : '#6b7280';
      
      doc.fontSize(10).font('Helvetica').fillColor(statusClr).text(`  ${statusIcon} `, { continued: true }).fillColor('#000000').text(item.item);
      
      if (item.defectNote) {
        doc.fontSize(9).fillColor('#dc2626').text(`      Defect: ${item.defectNote}`);
        doc.fillColor('#000000');
      }
    });
  }

  if (inspection.defects && inspection.defects.length > 0) {
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#dddddd');
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text('Defects Reported');
    doc.fillColor('#000000');
    doc.moveDown(0.5);

    inspection.defects.forEach((defect: any, idx: number) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${defect.item || 'General'}`);
      if (defect.note) {
        doc.fontSize(10).font('Helvetica').text(`   ${defect.note}`);
      }
      doc.moveDown(0.3);
    });
  }

  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#dddddd');
  doc.moveDown(1);

  doc.fontSize(9).fillColor('#666666').text('This document is an official record of a vehicle safety inspection.', { align: 'center' });
  doc.text('Any tampering with this document is prohibited.', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(8).text(`Report ID: ${inspection.id} | Generated by TitanFleet`, { align: 'center' });

  doc.end();
  return stream;
}

export function getInspectionFilename(inspection: { vehicleVrm: string; createdAt: string; type: string }): string {
  const date = new Date(inspection.createdAt);
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${inspection.vehicleVrm}_${inspection.type}_${dateStr}_${timeStr}.pdf`;
}
