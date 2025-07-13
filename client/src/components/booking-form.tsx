import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User, Mail, Phone, CreditCard, PlusCircle, Home, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { calculatePricing, saveFormData, getInitialFormData, clearFormData, markBookingCompleted, loadFormData, SERVICE_DATA, FREQUENCY_OPTIONS, DURATION_OPTIONS, TIME_SLOTS, TIP_OPTIONS } from '@/lib/booking-utils';

interface BookingFormProps {
  onPricingChange: (pricing: any) => void;
  onExtrasChange: (extras: any[]) => void;
  onFormDataChange: (data: any) => void;
}

export default function BookingForm({ onPricingChange, onExtrasChange, onFormDataChange }: BookingFormProps) {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState(() => {
    try {
      return getInitialFormData();
    } catch (error) {
      console.error('Error initializing form data:', error);
      return {
        serviceType: '',
        frequency: 'one-time',
        duration: 2,
        bedrooms: 1,
        bathrooms: 1,
        toilets: 0,
        livingRooms: 1,
        kitchen: 1,
        utilityRoom: 0,
        carpetCleaning: 0,
        propertyType: '',
        propertyStatus: '',
        surfaceType: '',
        surfaceMaterial: '',
        squareFootage: 0,
        bookingDate: '',
        bookingTime: '',
        fullName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        postcode: '',
        specialInstructions: '',
        quoteRequest: '',
        smsReminders: false,
        tipPercentage: 0,
        customTip: '',
        selectedExtras: [],
        selectedTimeSlot: '',
        notifyMoreTime: false,
        extrasQuantities: {}
      };
    }
  });

  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const [extrasQuantities, setExtrasQuantities] = useState<{[key: number]: number}>({});
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load service extras
  const { data: serviceExtras = [], error: serviceExtrasError } = useQuery({
    queryKey: ['/api/service-extras', formData.serviceType],
    enabled: !!formData.serviceType,
  });

  // Log service extras error if any
  if (serviceExtrasError) {
    console.error('Service extras error:', serviceExtrasError);
  }

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      return response.json();
    },
    onSuccess: (booking) => {
      // Mark booking as completed and clear all state
      markBookingCompleted();
      clearFormData();
      
      // Reset React state completely
      const initialData = getInitialFormData();
      setFormData(initialData);
      setSelectedExtras([]);
      setExtrasQuantities({});
      setVisibleSections([]);
      setSelectedTimeSlot('');
      
      // Navigate to confirmation - immediate redirect
      console.log('📄 Redirecting to booking confirmation with ID:', booking.id);
      window.location.href = `/booking-confirmation?bookingId=${booking.id}`;
      
      toast({
        title: "Booking Confirmed!",
        description: "Redirecting to your booking confirmation...",
      });
    },
    onError: (error: any) => {
      console.error('Booking creation error:', error);
      let errorMessage = "Failed to create booking. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Initialize extras state from form data on mount
  useEffect(() => {
    if (formData.selectedExtras && Array.isArray(formData.selectedExtras)) {
      setSelectedExtras(formData.selectedExtras);
    }
    if (formData.extrasQuantities && typeof formData.extrasQuantities === 'object') {
      setExtrasQuantities(formData.extrasQuantities);
    }
    if (formData.selectedTimeSlot && typeof formData.selectedTimeSlot === 'string') {
      setSelectedTimeSlot(formData.selectedTimeSlot);
    }
  }, []);

  // Simple direct update function - avoid calling during render
  const updateState = (newFormData: any = formData, newExtras: any[] = selectedExtras) => {
    const pricing = calculatePricing(newFormData, newExtras);
    
    // Only update if values have actually changed
    onPricingChange(pricing);
    onFormDataChange(newFormData);
    onExtrasChange(newExtras);
    
    saveFormData({
      ...newFormData,
      selectedExtras: newExtras,
      extrasQuantities,
      selectedTimeSlot
    });
  };

  const showNextSection = () => {
    const allSections = [
      'propertyDetails', 'surfaceDetails', 'additionalServices', 
      'dateTime', 'customerDetails', 'address', 'additionalInfo', 
      'tip', 'submitSection'
    ];
    
    const nextSection = allSections.find(section => !visibleSections.includes(section));
    if (nextSection) {
      setVisibleSections(prev => [...prev, nextSection]);
    }
  };

  const handleServiceTypeChange = (value: string) => {
    const newFormData = { ...formData, serviceType: value };
    setFormData(newFormData);
    setVisibleSections([]);
    setSelectedExtras([]);
    
    // Show appropriate section based on service type
    if (value === 'jet') {
      setVisibleSections(['surfaceDetails']);
    } else {
      setVisibleSections(['propertyDetails']);
    }
    
    updateState(newFormData, []);
  };

  const handleExtraQuantityChange = (extra: any, quantity: number) => {
    const newQuantities = { ...extrasQuantities, [extra.id]: quantity };
    setExtrasQuantities(newQuantities);
    
    // Update selectedExtras based on quantities
    let newExtras = selectedExtras.filter(e => e.id !== extra.id);
    if (quantity > 0) {
      newExtras = [...newExtras, { ...extra, quantity }];
    }
    
    setSelectedExtras(newExtras);
    updateState(formData, newExtras);
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    const newFormData = { ...formData, bookingTime: time };
    setFormData(newFormData);
    showNextSection();
    updateState(newFormData, selectedExtras);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pricing = calculatePricing(formData, selectedExtras);
    const bookingData = {
      ...formData,
      // Ensure frequency is always set (default to 'one-time' for non-general services)
      frequency: formData.frequency || 'one-time',
      // Convert numeric fields to integers
      duration: parseInt(formData.duration?.toString() || '2'),
      bedrooms: parseInt(formData.bedrooms?.toString() || '0'),
      bathrooms: parseInt(formData.bathrooms?.toString() || '0'),
      toilets: parseInt(formData.toilets?.toString() || '0'),
      livingRooms: parseInt(formData.livingRooms?.toString() || '0'),
      kitchen: parseInt(formData.kitchen?.toString() || '0'),
      utilityRoom: parseInt(formData.utilityRoom?.toString() || '0'),
      carpetCleaning: parseInt(formData.carpetCleaning?.toString() || '0'),
      squareFootage: parseInt(formData.squareFootage?.toString() || '0'),
      tipPercentage: parseInt(formData.tipPercentage?.toString() || '0'),
      // Handle extras array
      selectedExtras: selectedExtras.map(extra => `${extra.name} (x${extra.quantity || 1})`),
      // Handle pricing as strings for decimal fields
      basePrice: pricing.basePrice.toFixed(2),
      extrasTotal: pricing.extrasTotal.toFixed(2),
      tipAmount: pricing.tipAmount.toFixed(2),
      totalPrice: pricing.total.toFixed(2),
      customTip: formData.customTip || '0',
      // Ensure required fields are present
      bookingTime: selectedTimeSlot || formData.bookingTime,
    };

    console.log('Submitting booking data:', bookingData);
    createBookingMutation.mutate(bookingData);
  };

  const renderSectionNumber = (number: number) => (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">
      {number}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Type Selection */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-primary flex items-center">
            {renderSectionNumber(1)}
            <Home className="h-5 w-5 mr-2" />
            Service Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">Type of Service</Label>
              <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_DATA).map(([key, service]) => (
                    <SelectItem key={key} value={key}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => {
                const newFormData = { ...formData, frequency: value };
                setFormData(newFormData);
                updateState(newFormData, selectedExtras);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency..." />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details - Simplified for General/Standard Cleaning */}
      {visibleSections.includes('propertyDetails') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(2)}
              <Home className="h-5 w-5 mr-2" />
              {formData.serviceType === 'general' ? 'Select Time Duration' : 'Property Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* General/Standard Cleaning - Simple Duration Selection */}
            {formData.serviceType === 'general' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="duration" className="text-lg font-medium">Select Time Duration</Label>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Hours</Label>
                      <Select value={Math.floor(formData.duration || 2).toString()} onValueChange={(value) => {
                        const hours = parseInt(value);
                        const minutes = (formData.duration || 2) % 1 === 0.5 ? 30 : 0;
                        const newFormData = { ...formData, duration: hours + (minutes / 60) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="02" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">02</SelectItem>
                          <SelectItem value="3">03</SelectItem>
                          <SelectItem value="4">04</SelectItem>
                          <SelectItem value="5">05</SelectItem>
                          <SelectItem value="6">06</SelectItem>
                          <SelectItem value="7">07</SelectItem>
                          <SelectItem value="8">08</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Minutes</Label>
                      <Select value={((formData.duration || 2) % 1 === 0.5 ? 30 : 0).toString()} onValueChange={(value) => {
                        const hours = Math.floor(formData.duration || 2);
                        const minutes = parseInt(value);
                        const newFormData = { ...formData, duration: hours + (minutes / 60) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="00" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">00</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notifyMoreTime" 
                    checked={formData.notifyMoreTime || false}
                    onCheckedChange={(checked) => {
                      const newFormData = { ...formData, notifyMoreTime: checked };
                      setFormData(newFormData);
                      updateState(newFormData, selectedExtras);
                    }}
                  />
                  <Label htmlFor="notifyMoreTime" className="text-sm">
                    Notify me if the job requires more time.
                  </Label>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    type="button" 
                    onClick={() => setVisibleSections(prev => [...prev, 'additionalServices'])}
                    className="w-full"
                  >
                    Continue to Additional Services
                  </Button>
                </div>
              </div>
            )}
            
            {/* Deep Cleaning and End of Tenancy - Detailed Room Selection */}
            {(formData.serviceType === 'deep' || formData.serviceType === 'tenancy') && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Select value={formData.bedrooms?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, bedrooms: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="cloakroomToilets">Cloakroom Toilets</Label>
                      <Select value={formData.toilets?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, toilets: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="receptionRoom">Reception Room</Label>
                      <Select value={formData.livingRooms?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, livingRooms: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="carpetCleaning">Carpet Cleaning</Label>
                      <Select value={formData.carpetCleaning?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, carpetCleaning: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Select value={formData.bathrooms?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, bathrooms: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="kitchen">Kitchen</Label>
                      <Select value={formData.kitchen?.toString() || "1"} onValueChange={(value) => {
                        const newFormData = { ...formData, kitchen: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="utilityRoom">Utility Room</Label>
                      <Select value={formData.utilityRoom?.toString() || "0"} onValueChange={(value) => {
                        const newFormData = { ...formData, utilityRoom: parseInt(value) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sqFt">Sq Ft</Label>
                      <Select value={formData.squareFootage?.toString() || "1"} onValueChange={(value) => {
                        const newFormData = { ...formData, squareFootage: parseInt(value.split('-')[0]) };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="1 - 1200 Sq Ft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-1200">1 - 1200 Sq Ft</SelectItem>
                          <SelectItem value="1201-2000">1201 - 2000 Sq Ft</SelectItem>
                          <SelectItem value="2001-3000">2001 - 3000 Sq Ft</SelectItem>
                          <SelectItem value="3001-4000">3001 - 4000 Sq Ft</SelectItem>
                          <SelectItem value="4001-5000">4001 - 5000 Sq Ft</SelectItem>
                          <SelectItem value="5001+">5001+ Sq Ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => {
                      const newFormData = { ...formData, propertyType: value };
                      setFormData(newFormData);
                      if (value) showNextSection();
                      updateState(newFormData, selectedExtras);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="propertyStatus">Property Status</Label>
                    <Select value={formData.propertyStatus} onValueChange={(value) => {
                      const newFormData = { ...formData, propertyStatus: value };
                      setFormData(newFormData);
                      updateState(newFormData, selectedExtras);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="furnished">Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Show Additional Services Button */}
                {serviceExtras.length > 0 && !visibleSections.includes('additionalServices') && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setVisibleSections(prev => [...prev, 'additionalServices'])}
                      className="w-full"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Additional Services
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* AirBnB Cleaning - Special bedroom-based pricing */}
            {formData.serviceType === 'airbnb' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                  <Select value={formData.bedrooms?.toString() || "1"} onValueChange={(value) => {
                    const bedrooms = parseInt(value);
                    const duration = bedrooms + 1; // 1 bedroom = 2hrs, 2 bedrooms = 3hrs, etc.
                    const newFormData = { ...formData, bedrooms, duration };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} bedroom{num > 1 ? 's' : ''} ({num + 1} hours)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <p><strong>AirBnB Cleaning Pricing:</strong></p>
                  <p>• Service charge: £20/hour</p>
                  <p>• Duration: {formData.bedrooms ? formData.bedrooms + 1 : 2} hours for {formData.bedrooms || 1} bedroom{(formData.bedrooms || 1) > 1 ? 's' : ''}</p>
                  <p>• Internal laundry: FREE</p>
                  <p>• External laundry: £20/bed set</p>
                  <p>• Ironing: Additional charges apply</p>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    onClick={() => setVisibleSections(prev => [...prev, 'additionalServices'])}
                    className="w-full"
                  >
                    Continue to Additional Services
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Jet Washing/Garden Cleaning - Quote Request Form */}
      {formData.serviceType === 'jet' && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(2)}
              <Waves className="h-5 w-5 mr-2" />
              Jet Washing / Garden Cleaning Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p><strong>Jet Washing / Garden Cleaning Service:</strong></p>
                <p>• This service requires a custom quote based on your specific needs</p>
                <p>• Please provide detailed information about your requirements</p>
                <p>• We'll contact you within 24 hours with a personalized quote</p>
              </div>
              
              <div>
                <Label htmlFor="quoteRequest" className="text-lg font-medium">
                  Service Requirements & Quote Request
                </Label>
                <Textarea
                  id="quoteRequest"
                  placeholder="Please describe your jet washing/garden cleaning requirements in detail. Include:
- Size of area/property
- Specific services needed
- Frequency requirements
- Any special requirements or challenges
- Preferred timeline
- Budget range (if applicable)"
                  value={formData.quoteRequest || ''}
                  onChange={(e) => {
                    const newFormData = { ...formData, quoteRequest: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                  rows={8}
                  className="mt-2"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  type="button" 
                  onClick={() => setVisibleSections(prev => [...prev, 'additionalServices'])}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Continue to Additional Services
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commercial Cleaning - Quote Request Form */}
      {formData.serviceType === 'commercial' && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(2)}
              <Home className="h-5 w-5 mr-2" />
              Commercial Cleaning Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p><strong>Commercial Cleaning Service:</strong></p>
                <p>• This service requires a custom quote based on your specific needs</p>
                <p>• Please provide detailed information about your requirements</p>
                <p>• We'll contact you within 24 hours with a personalized quote</p>
              </div>
              
              <div>
                <Label htmlFor="quoteRequest" className="text-lg font-medium">
                  Service Requirements & Quote Request
                </Label>
                <Textarea
                  id="quoteRequest"
                  placeholder="Please describe your commercial cleaning requirements in detail. Include:
- Size of area/property
- Specific services needed
- Frequency requirements
- Any special requirements or challenges
- Preferred timeline
- Budget range (if applicable)"
                  value={formData.quoteRequest || ''}
                  onChange={(e) => {
                    const newFormData = { ...formData, quoteRequest: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                  rows={8}
                  className="mt-2"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  type="button" 
                  onClick={() => setVisibleSections(prev => [...prev, 'additionalServices'])}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Continue to Additional Services
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Services */}
      {visibleSections.includes('additionalServices') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(3)}
              <PlusCircle className="h-5 w-5 mr-2" />
              Additional Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Select any additional services you'd like to include</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceExtras.map((extra: any) => {
                const quantity = extrasQuantities[extra.id] || 0;
                return (
                  <div 
                    key={extra.id} 
                    className={`border-2 rounded-lg p-4 transition-all ${
                      quantity > 0 ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{extra.name}</h4>
                          <span className="text-sm font-semibold text-primary">£{extra.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{extra.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtraQuantityChange(extra, Math.max(0, quantity - 1))}
                            disabled={quantity <= 0}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtraQuantityChange(extra, quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                          {quantity > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              Total: £{(parseFloat(extra.price) * quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'dateTime'])}
                className="w-full"
              >
                Continue to Date & Time
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date & Time Selection */}
      {visibleSections.includes('dateTime') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(4)}
              <Calendar className="h-5 w-5 mr-2" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="bookingDate">Preferred Date</Label>
                <Input 
                  type="date" 
                  value={formData.bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newFormData = { ...formData, bookingDate: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
            </div>
            
            <div>
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {TIME_SLOTS && Array.isArray(TIME_SLOTS) ? TIME_SLOTS.map(timeSlot => (
                  <Button
                    key={timeSlot.value}
                    type="button"
                    variant={selectedTimeSlot === timeSlot.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSlotSelect(timeSlot.value)}
                    className="text-xs"
                  >
                    {String(timeSlot.label)}
                  </Button>
                )) : (
                  <div className="text-sm text-muted-foreground">No time slots available</div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'customerDetails'])}
                className="w-full"
              >
                Continue to Customer Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details */}
      {visibleSections.includes('customerDetails') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(5)}
              <User className="h-5 w-5 mr-2" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => {
                    const newFormData = { ...formData, fullName: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => {
                    const newFormData = { ...formData, email: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => {
                    const newFormData = { ...formData, phone: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'address'])}
                className="w-full"
              >
                Continue to Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Details */}
      {visibleSections.includes('address') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(6)}
              <MapPin className="h-5 w-5 mr-2" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="address1">Address Line 1</Label>
                <Input 
                  type="text" 
                  value={formData.address1}
                  onChange={(e) => {
                    const newFormData = { ...formData, address1: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input 
                  type="text" 
                  value={formData.address2}
                  onChange={(e) => {
                    const newFormData = { ...formData, address2: e.target.value };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => {
                      const newFormData = { ...formData, city: e.target.value };
                      setFormData(newFormData);
                      updateState(newFormData, selectedExtras);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input 
                    type="text" 
                    value={formData.postcode}
                    onChange={(e) => {
                      const newFormData = { ...formData, postcode: e.target.value };
                      setFormData(newFormData);
                      updateState(newFormData, selectedExtras);
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'additionalInfo'])}
                className="w-full"
              >
                Continue to Additional Info
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {visibleSections.includes('additionalInfo') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(7)}
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea 
                value={formData.specialInstructions}
                onChange={(e) => {
                  const newFormData = { ...formData, specialInstructions: e.target.value };
                  setFormData(newFormData);
                  updateState(newFormData, selectedExtras);
                }}
                placeholder="Any special requests or instructions..."
              />
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'tip'])}
                className="w-full"
              >
                Continue to Tip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tip Section */}
      {visibleSections.includes('tip') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(8)}
              <CreditCard className="h-5 w-5 mr-2" />
              Tip (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Tip Amount</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {TIP_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.tipPercentage === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newFormData = { ...formData, tipPercentage: option.value };
                        setFormData(newFormData);
                        updateState(newFormData, selectedExtras);
                      }}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {formData.tipPercentage === 'custom' && (
                <div>
                  <Label htmlFor="customTip">Custom Tip Amount (£)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.customTip}
                    onChange={(e) => {
                      const newFormData = { ...formData, customTip: e.target.value };
                      setFormData(newFormData);
                      updateState(newFormData, selectedExtras);
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setVisibleSections(prev => [...prev, 'submitSection'])}
                className="w-full"
              >
                Review & Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      {visibleSections.includes('submitSection') && (
        <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(9)}
              Confirm Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Service:</strong> {SERVICE_DATA[formData.serviceType as keyof typeof SERVICE_DATA]?.name}</p>
                  <p><strong>Date:</strong> {formData.bookingDate}</p>
                  <p><strong>Time:</strong> {selectedTimeSlot}</p>
                  <p><strong>Duration:</strong> {formData.duration} hours</p>
                  {selectedExtras.length > 0 && (
                    <p><strong>Extras:</strong> {selectedExtras.map(e => `${e.name} (x${e.quantity || 1})`).join(', ')}</p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}