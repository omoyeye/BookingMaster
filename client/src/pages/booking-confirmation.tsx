import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { generatePDFReceipt, downloadPDF, PDFBookingData } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';

export default function BookingConfirmation() {
  const [location] = useLocation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Extract booking ID from URL
  const bookingId = new URLSearchParams(location.split('?')[1] || '').get('bookingId');
  
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    enabled: !!bookingId,
  });

  const handleDownloadPDF = async () => {
    if (!booking) {
      console.error('📄 No booking data available for PDF generation');
      return;
    }
    
    console.log('📄 Starting PDF download process for booking:', booking.id);
    console.log('📄 Raw booking data:', booking);
    
    setIsGeneratingPDF(true);
    try {
      console.log('📄 Mapping booking data to PDF format...');
      const pdfData: PDFBookingData = {
        id: booking.id,
        serviceType: booking.serviceType,
        frequency: booking.frequency,
        duration: booking.duration,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        fullName: booking.fullName,
        email: booking.email,
        phone: booking.phone,
        address1: booking.address1,
        address2: booking.address2,
        city: booking.city,
        postcode: booking.postcode,
        selectedExtras: booking.selectedExtras || [],
        basePrice: booking.basePrice,
        extrasTotal: booking.extrasTotal,
        tipAmount: booking.tipAmount,
        totalPrice: booking.totalPrice,
        bedrooms: booking.bedrooms,
        bathrooms: booking.bathrooms,
        toilets: booking.toilets,
        livingRooms: booking.livingRooms,
        propertyType: booking.propertyType,
        surfaceType: booking.surfaceType,
        squareFootage: booking.squareFootage,
        specialInstructions: booking.specialInstructions,
        quoteRequest: booking.quoteRequest,
      };
      
      console.log('📄 PDF data prepared:', pdfData);
      console.log('📄 Calling generatePDFReceipt...');
      
      const pdfBlob = await generatePDFReceipt(pdfData);
      console.log('📄 PDF generated successfully, downloading...');
      
      downloadPDF(pdfBlob, `booking-receipt-${booking.id}.pdf`);
      console.log('📄 PDF download initiated');
      
    } catch (error) {
      console.error('📄 CRITICAL ERROR during PDF generation:', error);
      console.error('📄 Error details:', {
        message: error.message,
        stack: error.stack,
        bookingId: booking?.id,
        bookingData: booking
      });
      
      // Show user-friendly error message
      alert('There was an error generating the PDF receipt. Please try again or contact support.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Booking Found</h2>
              <p className="text-gray-600">Please check your booking confirmation link.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600">Unable to load booking details. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">
              Thank you for choosing CleanPro Services. Your booking has been successfully created.
            </p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Booking Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Booking ID</p>
                      <p className="text-lg font-semibold">#{booking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service Type</p>
                      <Badge variant="secondary">
                        {booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Cleaning
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="font-semibold">{booking.bookingDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Time</p>
                        <p className="font-semibold">{booking.bookingTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Frequency</p>
                      <p className="font-semibold">{booking.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="font-semibold">{booking.duration} hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="font-semibold">{booking.fullName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="font-semibold">{booking.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="font-semibold">{booking.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="font-semibold">
                        {booking.address1}
                        {booking.address2 && <><br />{booking.address2}</>}
                        <br />{booking.city}, {booking.postcode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pricing & Additional Services */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-semibold">£{booking.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Services</span>
                    <span className="font-semibold">£{booking.extrasTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span className="font-semibold">£{booking.tipAmount}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>£{booking.totalPrice}</span>
                  </div>
                </CardContent>
              </Card>

              {booking.selectedExtras && booking.selectedExtras.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {booking.selectedExtras.map((extra, index) => (
                        <Badge key={index} variant="outline">
                          {extra}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Download PDF Button */}
              <Card>
                <CardHeader>
                  <CardTitle>Download Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Receipt'}
                  </Button>
                </CardContent>
              </Card>

              {/* Support Info */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      <strong>Email Confirmation:</strong> You'll receive a confirmation email with all booking details shortly.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Support Contact:</strong> Our support team will reach out within 24 hours to confirm your booking and answer any questions.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Need Help?</strong> Contact us at (555) 123-4567 or info@cleanpro.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}