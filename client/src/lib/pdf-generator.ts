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
  propertyType?: string;
  surfaceType?: string;
  squareFootage?: number;
  specialInstructions?: string;
  quoteRequest?: string;
}

export function generatePDFReceipt(booking: PDFBookingData): Promise<Blob> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Company header with logo placeholder
    // TODO: Add company logo here when image loading is implemented
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('URINAKCLEANING', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Professional Cleaning Services', 20, 30);
    doc.text('86a High Street Beckenham, Kent, London BR3 1ED', 20, 38);
    doc.text('Phone: +44-7786687791', 20, 46);
    doc.text('Email: info@urinakcleaning.co.uk', 20, 54);
    
    // Receipt title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('BOOKING CONFIRMATION', 20, 75);
    
    // Booking ID
    doc.setFontSize(12);
    doc.text(`Booking ID: #${booking.id}`, 20, 75);
    
    // Service details
    let yPos = 90;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Service Details', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Service Type: ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Cleaning`, 20, yPos);
    yPos += 8;
    doc.text(`Frequency: ${booking.frequency}`, 20, yPos);
    yPos += 8;
    doc.text(`Duration: ${booking.duration} hours`, 20, yPos);
    yPos += 8;
    doc.text(`Date: ${booking.bookingDate}`, 20, yPos);
    yPos += 8;
    doc.text(`Time: ${booking.bookingTime}`, 20, yPos);
    
    // Property details
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Property Details', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (booking.bedrooms) {
      doc.text(`Bedrooms: ${booking.bedrooms}`, 20, yPos);
      yPos += 8;
      doc.text(`Bathrooms: ${booking.bathrooms}`, 20, yPos);
      yPos += 8;
      doc.text(`Toilets: ${booking.toilets}`, 20, yPos);
      yPos += 8;
      doc.text(`Living Rooms: ${booking.livingRooms}`, 20, yPos);
      yPos += 8;
    }
    
    if (booking.propertyType) {
      doc.text(`Property Type: ${booking.propertyType}`, 20, yPos);
      yPos += 8;
    }
    
    if (booking.surfaceType) {
      doc.text(`Surface Type: ${booking.surfaceType}`, 20, yPos);
      yPos += 8;
    }
    
    if (booking.squareFootage) {
      doc.text(`Square Footage: ${booking.squareFootage} sq ft`, 20, yPos);
      yPos += 8;
    }
    
    // Customer details
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Information', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${booking.fullName}`, 20, yPos);
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
    
    // Additional services
    if (booking.selectedExtras && booking.selectedExtras.length > 0) {
      yPos += 15;
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
    
    // Quote request details
    if (booking.quoteRequest) {
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Quote Request Details', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const quoteLines = booking.quoteRequest.split('\n');
      quoteLines.forEach(line => {
        if (line.trim()) {
          doc.text(line, 20, yPos);
          yPos += 8;
        }
      });
      
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(200, 0, 0);
      doc.text('Note: This service requires a custom quote. We will contact you within 24 hours.', 20, yPos);
    }
    
    // Pricing breakdown
    yPos += 15;
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
    
    // Total
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`TOTAL: £${booking.totalPrice}`, 20, yPos + 8);
    
    // Contact Information section
    yPos += 20;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Contact Information', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('For any questions or changes to your booking, please contact us:', 20, yPos);
    yPos += 8;
    doc.text('Phone: +44-7786687791', 20, yPos);
    yPos += 8;
    doc.text('Email: info@urinakcleaning.co.uk', 20, yPos);
    yPos += 8;
    doc.text('Business Hours: Monday - Sunday, 8:00 AM - 6:00 PM', 20, yPos);
    
    // Footer
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Thank you for choosing URINAKCLEANING for your cleaning needs!', 20, yPos);
    yPos += 8;
    doc.text('We look forward to serving you!', 20, yPos);
    
    // Convert to blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}