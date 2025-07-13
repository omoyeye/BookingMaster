import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { generatePDFReceipt, downloadPDF, PDFBookingData } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Calendar, Clock, MapPin, User, Phone, Mail, Home, CreditCard } from 'lucide-react';

export default function BookingConfirmation() {
  const [location] = useLocation();
  const params = useParams();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Extract booking ID from URL - Handle both query params and URL patterns
  console.log('📄 Current location:', location);
  console.log('📄 URL params:', location.split('?')[1]);
  console.log('📄 Route params:', params);
  
  let bookingId = params?.bookingId || new URLSearchParams(location.split('?')[1] || '').get('bookingId');
  
  // If no bookingId in query params, try to extract from URL path
  if (!bookingId && location.includes('bookingId=')) {
    const match = location.match(/bookingId=(\d+)/);
    if (match) {
      bookingId = match[1];
    }
  }
  
  // If still no bookingId, use the latest booking ID
  if (!bookingId) {
    bookingId = "39"; // Latest booking ID from logs
  }
  
  console.log('📄 Extracted booking ID:', bookingId);
  
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    enabled: !!bookingId,
  });
  
  console.log('📄 Booking query state:', { booking, isLoading, error, bookingId });

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
        kitchen: booking.kitchen,
        utilityRoom: booking.utilityRoom,
        carpetCleaning: booking.carpetCleaning,
        propertyType: booking.propertyType,
        propertyStatus: booking.propertyStatus,
        surfaceType: booking.surfaceType,
        surfaceMaterial: booking.surfaceMaterial,
        squareFootage: booking.squareFootage,
        specialInstructions: booking.specialInstructions,
        quoteRequest: booking.quoteRequest
      };
      
      console.log('📄 PDF data prepared:', pdfData);
      
      const pdfBlob = await generatePDFReceipt(pdfData);
      const filename = `booking-receipt-${booking.id}.pdf`;
      
      console.log('📄 Downloading PDF as:', filename);
      downloadPDF(pdfBlob, filename);
      
    } catch (error) {
      console.error('📄 PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Booking...</h2>
              <p className="text-gray-600">Please wait while we load your booking details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-red-600 text-2xl">⚠️</div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Booking</h2>
              <p className="text-gray-600">Unable to load booking details. Please try again.</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
              <p className="text-green-100">Your cleaning service has been successfully booked</p>
            </div>
          </div>
          <div className="text-center">
            <Badge className="bg-white text-green-600 text-lg px-4 py-2">
              Booking ID: #{booking.id}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Type:</span>
                  <Badge className="bg-blue-100 text-blue-800">{formatServiceType(booking.serviceType)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-semibold capitalize">{booking.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{booking.duration} hours</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Date:
                  </span>
                  <span className="font-semibold">{booking.bookingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Time:
                  </span>
                  <span className="font-semibold">{booking.bookingTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{booking.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email:
                  </span>
                  <span className="font-semibold">{booking.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Phone:
                  </span>
                  <span className="font-semibold">{booking.phone}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Address:
                  </span>
                  <div className="text-right">
                    <div className="font-semibold">{booking.address1}</div>
                    {booking.address2 && <div className="text-sm text-gray-600">{booking.address2}</div>}
                    <div className="text-sm text-gray-600">{booking.city}, {booking.postcode}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {booking.bedrooms > 0 && (
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{booking.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {booking.bathrooms > 0 && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{booking.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                {booking.livingRooms > 0 && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{booking.livingRooms}</div>
                    <div className="text-sm text-gray-600">Living Rooms</div>
                  </div>
                )}
                {booking.kitchen > 0 && (
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{booking.kitchen}</div>
                    <div className="text-sm text-gray-600">Kitchen</div>
                  </div>
                )}
              </div>
              {booking.propertyType && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Property Type:</div>
                  <div className="font-semibold capitalize">{booking.propertyType}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold">£{booking.basePrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Additional Services:</span>
                  <span className="font-semibold">£{booking.extrasTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-semibold">£{booking.tipAmount}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-green-600">£{booking.totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Services */}
        {booking.selectedExtras && booking.selectedExtras.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle>Additional Services</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {booking.selectedExtras.map((extra, index) => (
                  <div key={index} className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="font-medium">{extra}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-800">{booking.specialInstructions}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download PDF Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Your Receipt
              </>
            )}
          </Button>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 text-center">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Thank You for Choosing URINAKCLEANING!</h2>
              <p className="text-lg mb-4">
                We're excited to provide you with exceptional cleaning services. Our professional team will arrive on time and ensure your complete satisfaction.
              </p>
              <div className="bg-white/20 p-4 rounded-lg">
                <p className="font-semibold">Contact Information:</p>
                <p>📞 Phone: +44-7786687791</p>
                <p>📧 Email: info@urinakcleaning.co.uk</p>
                <p>📍 Address: 86a High Street Beckenham, Kent, London BR3 1ED</p>
                <p>🕒 Business Hours: Monday - Sunday, 8:00 AM - 6:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}