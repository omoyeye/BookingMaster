import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  SERVICE_DATA, 
  FREQUENCY_OPTIONS, 
  DURATION_OPTIONS, 
  TIME_SLOTS, 
  TIP_OPTIONS,
  calculateMinDate,
  calculatePricing,
  saveFormData,
  loadFormData,
  clearFormData
} from "@/lib/booking-utils";
import { 
  Fan, 
  Home, 
  SprayCanIcon, 
  PlusCircle, 
  Calendar, 
  User, 
  MapPin, 
  Info, 
  Heart,
  CalendarCheck
} from "lucide-react";

interface BookingFormProps {
  onPricingChange: (pricing: any) => void;
  onExtrasChange: (extras: any[]) => void;
  onFormDataChange: (data: any) => void;
}

export default function BookingForm({ onPricingChange, onExtrasChange, onFormDataChange }: BookingFormProps) {
  const [formData, setFormData] = useState({
    serviceType: '',
    frequency: '',
    duration: '',
    bedrooms: 2,
    bathrooms: 1,
    toilets: 1,
    livingRooms: 1,
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
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully created.",
      });
      clearFormData();
      // Reset form
      setFormData({
        serviceType: '',
        frequency: '',
        duration: '',
        bedrooms: 2,
        bathrooms: 1,
        toilets: 1,
        livingRooms: 1,
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
      setSelectedExtras([]);
      setVisibleSections([]);
      setSelectedTimeSlot('');
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

  // Auto-save form data - THROTTLED
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const dataToSave = {
        ...formData,
        selectedExtras,
        selectedTimeSlot
      };
      saveFormData(dataToSave);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData, selectedExtras, selectedTimeSlot]);

  // Calculate pricing - THROTTLED
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const pricing = calculatePricing(formData, selectedExtras);
      onPricingChange(pricing);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [formData, selectedExtras]);

  // Update parent with form data changes - THROTTLED
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFormDataChange(formData);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Update parent with extras changes - THROTTLED
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onExtrasChange(selectedExtras);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedExtras]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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
    updateFormData({ serviceType: value });
    setVisibleSections([]);
    setSelectedExtras([]);
    
    // Show appropriate section based on service type
    if (value === 'jet') {
      setVisibleSections(['surfaceDetails']);
    } else {
      setVisibleSections(['propertyDetails']);
    }
  };

  // Auto-show additional services section when service extras are loaded - DEBOUNCED
  useEffect(() => {
    if (serviceExtras.length > 0 && formData.serviceType && 
        (visibleSections.includes('propertyDetails') || visibleSections.includes('surfaceDetails')) &&
        !visibleSections.includes('additionalServices')) {
      const timeoutId = setTimeout(() => {
        setVisibleSections(prev => [...prev, 'additionalServices']);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [serviceExtras.length, formData.serviceType]);

  const handleExtraToggle = (extra: any) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    updateFormData({ bookingTime: time });
    showNextSection();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pricing = calculatePricing(formData, selectedExtras);
    const bookingData = {
      ...formData,
      duration: parseInt(formData.duration),
      squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
      selectedExtras: selectedExtras.map(e => e.name),
      basePrice: pricing.basePrice.toString(),
      extrasTotal: pricing.extrasTotal.toString(),
      tipAmount: pricing.tipAmount.toString(),
      totalPrice: pricing.total.toString(),
      bookingTime: selectedTimeSlot,
    };

    createBookingMutation.mutate(bookingData);
  };

  const renderSectionNumber = (number: number) => (
    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-semibold text-sm mr-3">
      {number}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
          <CalendarCheck className="h-8 w-8" />
          Book Your Service
        </h2>
        <p className="text-muted-foreground">Complete the form below to schedule your professional cleaning service</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Choose Your Service */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              {renderSectionNumber(1)}
              <Fan className="h-5 w-5 mr-2" />
              Choose Your Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service..." />
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
                  updateFormData({ frequency: value });
                  if (formData.serviceType && value) showNextSection();
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
              
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => {
                  updateFormData({ duration: value });
                  if (formData.serviceType && formData.frequency && value) showNextSection();
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
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Property Details */}
        {visibleSections.includes('propertyDetails') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(2)}
                <Home className="h-5 w-5 mr-2" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData({ bedrooms: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData({ bathrooms: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="toilets">Toilets</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={formData.toilets}
                    onChange={(e) => updateFormData({ toilets: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="livingRooms">Living Rooms</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="10" 
                    value={formData.livingRooms}
                    onChange={(e) => updateFormData({ livingRooms: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => {
                    updateFormData({ propertyType: value });
                    if (value) showNextSection();
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
                  <Select value={formData.propertyStatus} onValueChange={(value) => updateFormData({ propertyStatus: value })}>
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
            </CardContent>
          </Card>
        )}

        {/* Section 2: Surface Details (Alternative for Jet Washing) */}
        {visibleSections.includes('surfaceDetails') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(2)}
                <SprayCanIcon className="h-5 w-5 mr-2" />
                Surface Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="surfaceType">Surface Type</Label>
                  <Select value={formData.surfaceType} onValueChange={(value) => {
                    updateFormData({ surfaceType: value });
                    if (value) showNextSection();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patio">Patio</SelectItem>
                      <SelectItem value="driveway">Driveway</SelectItem>
                      <SelectItem value="deck">Deck</SelectItem>
                      <SelectItem value="walls">Walls</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="surfaceMaterial">Surface Material</Label>
                  <Select value={formData.surfaceMaterial} onValueChange={(value) => updateFormData({ surfaceMaterial: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concrete">Concrete</SelectItem>
                      <SelectItem value="brick">Brick</SelectItem>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="stone">Stone</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10000" 
                    placeholder="Enter sq ft"
                    value={formData.squareFootage}
                    onChange={(e) => updateFormData({ squareFootage: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Additional Services */}
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
                          <span className="font-medium">{extra.name}</span>
                          <span className="text-primary font-semibold">+£{extra.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{extra.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {serviceExtras.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button type="button" onClick={showNextSection}>
                    Continue to Date & Time
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 4: Date & Time */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bookingDate">Preferred Date</Label>
                  <Input 
                    type="date" 
                    value={formData.bookingDate}
                    min={formData.serviceType ? calculateMinDate(formData.serviceType) : ''}
                    onChange={(e) => {
                      updateFormData({ bookingDate: e.target.value });
                      if (e.target.value && selectedTimeSlot) showNextSection();
                    }}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum {SERVICE_DATA[formData.serviceType as keyof typeof SERVICE_DATA]?.minNotice || 2} days notice required
                  </p>
                </div>
                
                <div>
                  <Label>Preferred Time</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {TIME_SLOTS.map(slot => (
                      <Button
                        key={slot.value}
                        type="button"
                        variant={selectedTimeSlot === slot.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTimeSlotSelect(slot.value)}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 5: Your Details */}
        {visibleSections.includes('customerDetails') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(5)}
                <User className="h-5 w-5 mr-2" />
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => {
                      updateFormData({ fullName: e.target.value });
                      if (e.target.value && formData.email && formData.phone) showNextSection();
                    }}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => {
                      updateFormData({ email: e.target.value });
                      if (formData.fullName && e.target.value && formData.phone) showNextSection();
                    }}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => {
                      updateFormData({ phone: e.target.value });
                      if (formData.fullName && formData.email && e.target.value) showNextSection();
                    }}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 6: Address */}
        {visibleSections.includes('address') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(6)}
                <MapPin className="h-5 w-5 mr-2" />
                Service Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input 
                      placeholder="Enter your address"
                      value={formData.address1}
                      onChange={(e) => {
                        updateFormData({ address1: e.target.value });
                        if (e.target.value && formData.city && formData.postcode) showNextSection();
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input 
                      placeholder="Apartment, suite, etc."
                      value={formData.address2}
                      onChange={(e) => updateFormData({ address2: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => {
                        updateFormData({ city: e.target.value });
                        if (formData.address1 && e.target.value && formData.postcode) showNextSection();
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input 
                      placeholder="Enter postcode"
                      value={formData.postcode}
                      onChange={(e) => {
                        updateFormData({ postcode: e.target.value });
                        if (formData.address1 && formData.city && e.target.value) showNextSection();
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 7: Additional Information */}
        {visibleSections.includes('additionalInfo') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(7)}
                <Info className="h-5 w-5 mr-2" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea 
                    placeholder="Any special requests or instructions for our team..."
                    value={formData.specialInstructions}
                    onChange={(e) => {
                      updateFormData({ specialInstructions: e.target.value });
                      if (!visibleSections.includes('tip')) showNextSection();
                    }}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Optional - Maximum 1000 characters</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="smsReminders"
                    checked={formData.smsReminders}
                    onCheckedChange={(checked) => updateFormData({ smsReminders: checked as boolean })}
                  />
                  <Label htmlFor="smsReminders">Send me SMS reminders about my booking</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 8: Tip */}
        {visibleSections.includes('tip') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                {renderSectionNumber(8)}
                <Heart className="h-5 w-5 mr-2" />
                Tip (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipPercentage">Tip Amount</Label>
                    <Select value={formData.tipPercentage} onValueChange={(value) => {
                      updateFormData({ tipPercentage: value });
                      if (!visibleSections.includes('submitSection')) showNextSection();
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIP_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.tipPercentage === 'custom' && (
                    <div>
                      <Label htmlFor="customTip">Custom Tip Amount (£)</Label>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter custom tip amount"
                        value={formData.customTip}
                        onChange={(e) => updateFormData({ customTip: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tips are greatly appreciated by our cleaning professionals and help support quality service.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {visibleSections.includes('submitSection') && (
          <Card className="shadow-md animate-in fade-in-0 slide-in-from-bottom-4">
            <CardContent className="pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={createBookingMutation.isPending}
              >
                <CalendarCheck className="h-5 w-5 mr-2" />
                {createBookingMutation.isPending ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
