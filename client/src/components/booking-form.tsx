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
import { calculatePricing, saveFormData, loadFormData, clearFormData, SERVICE_DATA, FREQUENCY_OPTIONS, DURATION_OPTIONS, TIME_SLOTS, TIP_OPTIONS } from '@/lib/booking-utils';

interface BookingFormProps {
  onPricingChange: (pricing: any) => void;
  onExtrasChange: (extras: any[]) => void;
  onFormDataChange: (data: any) => void;
}

export default function BookingForm({ onPricingChange, onExtrasChange, onFormDataChange }: BookingFormProps) {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    serviceType: '',
    frequency: '',
    duration: 2,
    bedrooms: '',
    bathrooms: '',
    toilets: '',
    livingRooms: '',
    propertyType: '',
    propertyStatus: '',
    surfaceType: '',
    surfaceMaterial: '',
    squareFootage: '',
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
    smsReminders: false,
    tipPercentage: '0',
    customTip: ''
  });

  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load service extras
  const { data: serviceExtras = [] } = useQuery({
    queryKey: ['/api/service-extras', formData.serviceType],
    enabled: !!formData.serviceType,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      clearFormData();
      setLocation(`/booking-confirmation?bookingId=${booking.id}`);
      toast({
        title: "Booking Confirmed!",
        description: "Redirecting to your booking confirmation...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load saved data on mount - ONLY ONCE
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      setFormData(prev => ({ ...prev, ...savedData }));
      if (savedData.selectedExtras) {
        setSelectedExtras(savedData.selectedExtras);
      }
      if (savedData.selectedTimeSlot) {
        setSelectedTimeSlot(savedData.selectedTimeSlot);
      }
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

  const handleExtraToggle = (extra: any) => {
    const exists = selectedExtras.find(e => e.id === extra.id);
    let newExtras;
    if (exists) {
      newExtras = selectedExtras.filter(e => e.id !== extra.id);
    } else {
      newExtras = [...selectedExtras, extra];
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
      selectedExtras: selectedExtras.map(extra => extra.name),
      basePrice: pricing.basePrice.toFixed(2),
      extrasTotal: pricing.extrasTotal.toFixed(2),
      tipAmount: pricing.tipAmount.toFixed(2),
      totalPrice: pricing.total.toFixed(2),
    };

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
            {formData.serviceType === 'general' && (
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {FREQUENCY_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.frequency === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newFormData = { ...formData, frequency: option.value };
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
            )}
            
            {formData.serviceType !== 'general' && (
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
            )}
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
            
            {/* Other Services - Keep existing simple form */}
            {formData.serviceType && !['general', 'deep', 'tenancy'].includes(formData.serviceType) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Select value={formData.duration?.toString() || "2"} onValueChange={(value) => {
                    const newFormData = { ...formData, duration: parseInt(value) };
                    setFormData(newFormData);
                    updateState(newFormData, selectedExtras);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {serviceExtras.map((extra: any) => (
                <div 
                  key={extra.id} 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${
                    selectedExtras.find(e => e.id === extra.id) ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => handleExtraToggle(extra)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={!!selectedExtras.find(e => e.id === extra.id)}
                      onCheckedChange={() => handleExtraToggle(extra)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{extra.name}</h4>
                        <span className="text-sm font-semibold text-primary">£{extra.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{extra.description}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                {TIME_SLOTS.map(time => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTimeSlot === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSlotSelect(time)}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
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
                    <p><strong>Extras:</strong> {selectedExtras.map(e => e.name).join(', ')}</p>
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