import jsPDF from 'jspdf';
import { Booking } from '@shared/schema';

export interface PDFBookingData {
  id: number;
  serviceType: string;
  frequency: string;
  duration: number;
  bookingDate: string;
  bookingTime: string;
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  selectedExtras: string[];
  basePrice: string;
  extrasTotal: string;
  tipAmount: string;
  totalPrice: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  livingRooms?: number;
  kitchen?: number;
  utilityRoom?: number;
  carpetCleaning?: number;
  propertyType?: string;
  propertyStatus?: string;
  surfaceType?: string;
  surfaceMaterial?: string;
  squareFootage?: number;
  specialInstructions?: string;
  quoteRequest?: string;
}

export function generatePDFReceipt(booking: PDFBookingData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 Starting PDF generation for booking:', booking.id);
      console.log('📄 Booking data received:', booking);
      
      const doc = new jsPDF();
      console.log('📄 jsPDF instance created successfully');
      
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      
      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace = 20) => {
        if (yPos + requiredSpace > pageHeight - marginBottom) {
          doc.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };
      
      // Helper function to format service type
      const formatServiceType = (type: string) => {
        const serviceTypes = {
          'general': 'General Cleaning',
          'deep': 'Deep Cleaning',
          'tenancy': 'End of Tenancy Cleaning',
          'airbnb': 'Airbnb Cleaning',
          'commercial': 'Commercial Cleaning',
          'jet': 'Jet Washing / Garden Cleaning'
        };
        return serviceTypes[type as keyof typeof serviceTypes] || type;
      };
    
      // Company header with logo and branding
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('URINAKCLEANING', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('Professional Cleaning Services', 20, yPos);
      yPos += 8;
      doc.text('86a High Street Beckenham, Kent, London BR3 1ED', 20, yPos);
      yPos += 8;
      doc.text('Phone: +44-7786687791', 20, yPos);
      yPos += 8;
      doc.text('Email: info@urinakcleaning.co.uk', 20, yPos);
      yPos += 8;
      doc.text('Business Hours: Monday - Sunday, 8:00 AM - 6:00 PM', 20, yPos);
      
      // Add company logo placeholder (future enhancement)
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('[COMPANY LOGO]', 150, 25);
      
      // Booking confirmation title
      yPos += 25;
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('BOOKING CONFIRMATION', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.text(`Booking ID: #${booking.id}`, 20, yPos);
      yPos += 8;
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 20, yPos);
      
      // Service details
      yPos += 20;
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Service Details', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Service Type: ${formatServiceType(booking.serviceType)}`, 20, yPos);
      yPos += 8;
      doc.text(`Frequency: ${booking.frequency}`, 20, yPos);
      yPos += 8;
      doc.text(`Duration: ${booking.duration} hours`, 20, yPos);
      yPos += 8;
      doc.text(`Scheduled Date: ${booking.bookingDate}`, 20, yPos);
      yPos += 8;
      doc.text(`Scheduled Time: ${booking.bookingTime}`, 20, yPos);
      
      // Customer Information
      yPos += 20;
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Customer Information', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Full Name: ${booking.fullName}`, 20, yPos);
      yPos += 8;
      doc.text(`Email: ${booking.email}`, 20, yPos);
      yPos += 8;
      doc.text(`Phone: ${booking.phone}`, 20, yPos);
      yPos += 8;
      doc.text(`Address: ${booking.address1}`, 20, yPos);
      yPos += 8;
      if (booking.address2) {
        doc.text(`         ${booking.address2}`, 20, yPos);
        yPos += 8;
      }
      doc.text(`         ${booking.city}, ${booking.postcode}`, 20, yPos);
      
      // Property details
      yPos += 20;
      checkNewPage(120);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Property Details', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      if (booking.bedrooms && booking.bedrooms > 0) {
        doc.text(`Bedrooms: ${booking.bedrooms}`, 20, yPos);
        yPos += 8;
      }
      if (booking.bathrooms && booking.bathrooms > 0) {
        doc.text(`Bathrooms: ${booking.bathrooms}`, 20, yPos);
        yPos += 8;
      }
      if (booking.toilets && booking.toilets > 0) {
        doc.text(`Toilets: ${booking.toilets}`, 20, yPos);
        yPos += 8;
      }
      if (booking.livingRooms && booking.livingRooms > 0) {
        doc.text(`Living Rooms: ${booking.livingRooms}`, 20, yPos);
        yPos += 8;
      }
      if (booking.kitchen && booking.kitchen > 0) {
        doc.text(`Kitchen: ${booking.kitchen}`, 20, yPos);
        yPos += 8;
      }
      if (booking.utilityRoom && booking.utilityRoom > 0) {
        doc.text(`Utility Room: ${booking.utilityRoom}`, 20, yPos);
        yPos += 8;
      }
      if (booking.carpetCleaning && booking.carpetCleaning > 0) {
        doc.text(`Carpet Cleaning: ${booking.carpetCleaning}`, 20, yPos);
        yPos += 8;
      }
      if (booking.propertyType) {
        doc.text(`Property Type: ${booking.propertyType}`, 20, yPos);
        yPos += 8;
      }
      if (booking.propertyStatus) {
        doc.text(`Property Status: ${booking.propertyStatus}`, 20, yPos);
        yPos += 8;
      }
      if (booking.surfaceType) {
        doc.text(`Surface Type: ${booking.surfaceType}`, 20, yPos);
        yPos += 8;
      }
      if (booking.surfaceMaterial) {
        doc.text(`Surface Material: ${booking.surfaceMaterial}`, 20, yPos);
        yPos += 8;
      }
      if (booking.squareFootage && booking.squareFootage > 0) {
        doc.text(`Square Footage: ${booking.squareFootage} sq ft`, 20, yPos);
        yPos += 8;
      }
      
      // Additional services
      if (booking.selectedExtras && booking.selectedExtras.length > 0) {
        yPos += 15;
        checkNewPage(50 + (booking.selectedExtras.length * 8));
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Additional Services', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        booking.selectedExtras.forEach(extra => {
          doc.text(`• ${extra}`, 25, yPos);
          yPos += 8;
        });
      }
      
      // Special instructions
      if (booking.specialInstructions && booking.specialInstructions.trim()) {
        yPos += 15;
        checkNewPage(60);
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Special Instructions', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        
        // Split long instructions into multiple lines
        const instructionLines = doc.splitTextToSize(booking.specialInstructions, 170);
        instructionLines.forEach((line: string) => {
          checkNewPage(10);
          doc.text(line, 20, yPos);
          yPos += 8;
        });
      }
      
      // Quote request details
      if (booking.quoteRequest && booking.quoteRequest.trim()) {
        yPos += 15;
        checkNewPage(60);
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Quote Request Details', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        
        // Split long quote request into multiple lines
        const quoteLines = doc.splitTextToSize(booking.quoteRequest, 170);
        quoteLines.forEach((line: string) => {
          checkNewPage(10);
          doc.text(line, 20, yPos);
          yPos += 8;
        });
        
        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text('Note: This service requires a custom quote. We will contact you within 24 hours.', 20, yPos);
      }
      
      // Pricing breakdown
      yPos += 20;
      checkNewPage(100);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Pricing Breakdown', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Base Price: £${booking.basePrice}`, 20, yPos);
      yPos += 8;
      doc.text(`Additional Services: £${booking.extrasTotal}`, 20, yPos);
      yPos += 8;
      doc.text(`Tip: £${booking.tipAmount}`, 20, yPos);
      yPos += 8;
      
      // Draw a line for total
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 2, 100, yPos + 2);
      yPos += 8;
      
      // Total
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`TOTAL: £${booking.totalPrice}`, 20, yPos);
      
      // Payment information
      yPos += 20;
      checkNewPage(40);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Payment Information', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Payment will be collected upon service completion.', 20, yPos);
      yPos += 8;
      doc.text('We accept cash, card, and bank transfer payments.', 20, yPos);
      yPos += 8;
      doc.text('A receipt will be provided after payment.', 20, yPos);
      
      // Contact Information section
      yPos += 20;
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Contact Information', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('For any questions, changes to your booking, or concerns, please contact us:', 20, yPos);
      yPos += 8;
      doc.text('Phone: +44-7786687791', 20, yPos);
      yPos += 8;
      doc.text('Email: info@urinakcleaning.co.uk', 20, yPos);
      yPos += 8;
      doc.text('Address: 86a High Street Beckenham, Kent, London BR3 1ED', 20, yPos);
      yPos += 8;
      doc.text('Business Hours: Monday - Sunday, 8:00 AM - 6:00 PM', 20, yPos);
      
      // What to expect section
      yPos += 20;
      checkNewPage(100);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('What to Expect', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('• Our professional team will arrive on time and ready to work', 20, yPos);
      yPos += 8;
      doc.text('• We bring all necessary cleaning supplies and equipment', 20, yPos);
      yPos += 8;
      doc.text('• You will receive a courtesy call 30 minutes before arrival', 20, yPos);
      yPos += 8;
      doc.text('• All our cleaners are insured and background checked', 20, yPos);
      yPos += 8;
      doc.text('• We guarantee your satisfaction with our service', 20, yPos);
      yPos += 8;
      doc.text('• Payment is due upon completion of the service', 20, yPos);
      
      // Thank you message
      yPos += 20;
      checkNewPage(60);
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Thank You for Choosing URINAKCLEANING!', 20, yPos);
      
      yPos += 12;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('We appreciate your business and look forward to providing you with excellent cleaning services.', 20, yPos);
      yPos += 8;
      doc.text('Our professional team will arrive on time and ensure your complete satisfaction.', 20, yPos);
      yPos += 8;
      doc.text('If you have any questions or need to make changes, please don\'t hesitate to contact us.', 20, yPos);
      
      // Footer
      yPos += 15;
      checkNewPage(20);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('This is your official booking confirmation. Please keep this receipt for your records.', 20, yPos);
      yPos += 8;
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 20, yPos);
      
      console.log('📄 PDF generation completed successfully');
      
      // Return the PDF as a Blob
      const pdfBlob = doc.output('blob');
      console.log('📄 PDF blob created successfully, size:', pdfBlob.size);
      resolve(pdfBlob);
      
    } catch (error) {
      console.error('📄 ERROR during PDF generation:', error);
      console.error('📄 Error stack:', error.stack);
      reject(error);
    }
  });
}

export function downloadPDF(blob: Blob, filename: string) {
  console.log('📄 Starting PDF download:', filename);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('📄 PDF download completed');
}