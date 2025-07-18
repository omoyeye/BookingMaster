import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User, Mail, Phone, CreditCard, PlusCircle, Home, Waves, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { calculatePricing, saveFormData, getInitialFormData, clearFormData, markBookingCompleted, loadFormData, SERVICE_DATA, FREQUENCY_OPTIONS, DURATION_OPTIONS, TIME_SLOTS, TIP_OPTIONS } from '@/lib/booking-utils';

interface BookingFormProps {
  onPricingChange: (pricing: any) => void;
  onExtrasChange: (extras: any[]) => void;
  onFormDataChange: (data: any) => void;
}

export default function BookingFormWizard({ onPricingChange, onExtrasChange, onFormDataChange }: BookingFormProps) {
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
  const [currentStep, setCurrentStep] = useState(1);
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
      setCurrentStep(1);
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

  // Define step structure based on service type
  const getStepStructure = (serviceType: string) => {
    const baseSteps = [
      { id: 1, name: 'service', title: 'Service Type' },
      { id: 2, name: 'property', title: serviceType === 'jet' ? 'Surface Details' : 'Property Details' },
      { id: 3, name: 'extras', title: 'Additional Services' },
      { id: 4, name: 'datetime', title: 'Date & Time' },
      { id: 5, name: 'customer', title: 'Customer Details' },
      { id: 6, name: 'address', title: 'Address Details' },
      { id: 7, name: 'additional', title: 'Additional Information' },
      { id: 8, name: 'tip', title: 'Tip Selection' },
      { id: 9, name: 'review', title: 'Review & Submit' }
    ];
    
    // For commercial, jet washing, and airbnb services, skip some steps
    if (serviceType === 'commercial' || serviceType === 'jet' || serviceType === 'airbnb') {
      return baseSteps
        .filter(step => step.name !== 'extras' && step.name !== 'tip')
        .map((step, index) => ({ ...step, id: index + 1 })); // Reindex IDs
    }
    
    return baseSteps;
  };

  const steps = getStepStructure(formData.serviceType);
  const totalSteps = steps.length;
  const currentStepName = steps[currentStep - 1]?.name;
  
  // Debug logging for step progression
  console.log('Service type:', formData.serviceType);
  console.log('Current step:', currentStep);
  console.log('Current step name:', currentStepName);
  console.log('Total steps:', totalSteps);
  console.log('Steps:', steps.map(s => s.name));

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
    }
  };

  const handleServiceTypeChange = (value: string) => {
    const newFormData = { ...formData, serviceType: value };
    setFormData(newFormData);
    setSelectedExtras([]);
    setCurrentStep(1); // Reset to first step when service type changes
    
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

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">- {steps[currentStep - 1]?.title}</span>
        </div>
        <div className="flex space-x-1">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`w-3 h-3 rounded-full ${
                index + 1 === currentStep 
                  ? 'bg-primary' 
                  : index + 1 < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Navigation buttons component
  const NavigationButtons = ({ onNext, onPrev, canProceed = true, nextText = 'Next' }: {
    onNext?: () => void;
    onPrev?: () => void;
    canProceed?: boolean;
    nextText?: string;
  }) => (
    <div className="flex justify-between pt-4 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPrev || previousStep}
        disabled={currentStep === 1}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      <Button 
        type="button" 
        onClick={onNext || nextStep}
        disabled={!canProceed}
        className="flex items-center"
      >
        {nextText}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StepIndicator />
      
      {/* Dynamic Step Rendering */}
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const stepName = step.name;
        
        if (currentStep !== stepNumber) return null;
        
        switch (stepName) {
          case 'service':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <Settings className="h-5 w-5 mr-2" />
                    Service Selection
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
                  
                  <NavigationButtons canProceed={!!formData.serviceType} />
                </CardContent>
              </Card>
            );
            
          case 'property':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <Home className="h-5 w-5 mr-2" />
                    {formData.serviceType === 'general' ? 'Select Time Duration' : 'Property Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* General/Standard Cleaning - Simple Duration Selection */}
                  {formData.serviceType === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <Label>Duration</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            <Select value={Math.floor(formData.duration || 2).toString()} onValueChange={(value) => {
                              const hours = parseInt(value);
                              const minutes = (formData.duration || 2) % 1 * 60;
                              const newFormData = { ...formData, duration: hours + (minutes / 60) };
                              setFormData(newFormData);
                              updateState(newFormData, selectedExtras);
                            }}>
                              <SelectTrigger className="w-16">
                                <SelectValue placeholder="2" />
                              </SelectTrigger>
                              <SelectContent>
                                {[2,3,4,5,6,7,8].map(hour => (
                                  <SelectItem key={hour} value={hour.toString()}>{hour}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-sm">hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Select value={((formData.duration || 2) % 1 * 60).toString()} onValueChange={(value) => {
                              const hours = Math.floor(formData.duration || 2);
                              const minutes = parseInt(value);
                              const newFormData = { ...formData, duration: hours + (minutes / 60) };
                              setFormData(newFormData);
                              updateState(newFormData, selectedExtras);
                            }}>
                              <SelectTrigger className="w-16">
                                <SelectValue placeholder="00" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">00</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-sm">minutes</span>
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
                      
                      <NavigationButtons />
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
                            <Label htmlFor="toilets">Toilets</Label>
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
                            <Label htmlFor="kitchen">Kitchen</Label>
                            <Select value={formData.kitchen?.toString() || "0"} onValueChange={(value) => {
                              const newFormData = { ...formData, kitchen: parseInt(value) };
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
                            <Label htmlFor="livingRooms">Reception Room</Label>
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
                            <Label htmlFor="sqFt">Square Footage</Label>
                            <Select value={formData.squareFootage?.toString() || "1200"} onValueChange={(value) => {
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
                      
                      <NavigationButtons />
                    </div>
                  )}
                  
                  {/* AirBnB Service - Bedroom Selection */}
                  {formData.serviceType === 'airbnb' && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                        <Select value={formData.bedrooms?.toString() || "1"} onValueChange={(value) => {
                          const bedrooms = parseInt(value);
                          const duration = bedrooms === 1 ? 2 : bedrooms === 2 ? 3 : bedrooms === 3 ? 4 : bedrooms === 4 ? 4.5 : 5;
                          const newFormData = { ...formData, bedrooms, duration };
                          setFormData(newFormData);
                          updateState(newFormData, selectedExtras);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bedrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 bedroom (2 hours)</SelectItem>
                            <SelectItem value="2">2 bedrooms (3 hours)</SelectItem>
                            <SelectItem value="3">3 bedrooms (4 hours)</SelectItem>
                            <SelectItem value="4">4 bedrooms (4.5 hours)</SelectItem>
                            <SelectItem value="5">5 bedrooms (5 hours)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <NavigationButtons />
                    </div>
                  )}
                  
                  {/* Jet Washing Service - Surface Details */}
                  {formData.serviceType === 'jet' && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="specialInstructions">Surface Details & Requirements</Label>
                        <Textarea 
                          value={formData.specialInstructions || ''}
                          onChange={(e) => {
                            const newFormData = { ...formData, specialInstructions: e.target.value };
                            setFormData(newFormData);
                            updateState(newFormData, selectedExtras);
                          }}
                          placeholder="Please describe the surfaces to be cleaned (driveway, patio, deck, etc.) and any specific requirements..."
                          className="min-h-[120px]"
                        />
                      </div>
                      
                      <NavigationButtons />
                    </div>
                  )}
                  
                  {/* Commercial Service - Property Details */}
                  {formData.serviceType === 'commercial' && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="specialInstructions">Commercial Property Details</Label>
                        <Textarea 
                          value={formData.specialInstructions || ''}
                          onChange={(e) => {
                            const newFormData = { ...formData, specialInstructions: e.target.value };
                            setFormData(newFormData);
                            updateState(newFormData, selectedExtras);
                          }}
                          placeholder="Please describe your commercial property (office space, retail store, etc.) and cleaning requirements..."
                          className="min-h-[120px]"
                        />
                      </div>
                      
                      <NavigationButtons />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            
          case 'extras':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Additional Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceExtras.map((extra: any) => (
                      <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{extra.name}</h4>
                          <p className="text-sm text-gray-600">£{extra.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtraQuantityChange(extra, Math.max(0, (extrasQuantities[extra.id] || 0) - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{extrasQuantities[extra.id] || 0}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtraQuantityChange(extra, (extrasQuantities[extra.id] || 0) + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <NavigationButtons />
                </CardContent>
              </Card>
            );
            
          case 'datetime':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <Calendar className="h-5 w-5 mr-2" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bookingDate">Booking Date</Label>
                      <Input 
                        type="date" 
                        value={formData.bookingDate}
                        onChange={(e) => {
                          const newFormData = { ...formData, bookingDate: e.target.value };
                          setFormData(newFormData);
                          updateState(newFormData, selectedExtras);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <Label>Preferred Time</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {TIME_SLOTS.map((time) => (
                          <Button
                            key={time.value}
                            type="button"
                            variant={selectedTimeSlot === time.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotSelect(time.value)}
                            className="text-xs"
                          >
                            {time.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <NavigationButtons canProceed={!!(formData.bookingDate && selectedTimeSlot)} />
                </CardContent>
              </Card>
            );
            
          case 'customer':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <User className="h-5 w-5 mr-2" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                  
                  <NavigationButtons canProceed={!!(formData.fullName && formData.email && formData.phone)} />
                </CardContent>
              </Card>
            );
            
          case 'address':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                  
                  <NavigationButtons canProceed={!!(formData.address1 && formData.city && formData.postcode)} />
                </CardContent>
              </Card>
            );
            
          case 'additional':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions</Label>
                      <Textarea 
                        value={formData.specialInstructions}
                        onChange={(e) => {
                          const newFormData = { ...formData, specialInstructions: e.target.value };
                          setFormData(newFormData);
                          updateState(newFormData, selectedExtras);
                        }}
                        placeholder="Any special instructions or requirements..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="smsReminders" 
                        checked={formData.smsReminders || false}
                        onCheckedChange={(checked) => {
                          const newFormData = { ...formData, smsReminders: checked };
                          setFormData(newFormData);
                          updateState(newFormData, selectedExtras);
                        }}
                      />
                      <Label htmlFor="smsReminders" className="text-sm">
                        Send me SMS reminders about my booking
                      </Label>
                    </div>
                  </div>
                  
                  <NavigationButtons />
                </CardContent>
              </Card>
            );
            
          case 'tip':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    <CreditCard className="h-5 w-5 mr-2" />
                    Tip Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Tip Amount</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {TIP_OPTIONS.map((tip) => (
                          <Button
                            key={tip.value}
                            type="button"
                            variant={formData.tipPercentage === tip.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newFormData = { ...formData, tipPercentage: tip.value };
                              setFormData(newFormData);
                              updateState(newFormData, selectedExtras);
                            }}
                            className="text-xs"
                          >
                            {tip.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {formData.tipPercentage === -1 && (
                      <div>
                        <Label htmlFor="customTip">Custom Tip Amount (£)</Label>
                        <Input 
                          type="number" 
                          value={formData.customTip}
                          onChange={(e) => {
                            const newFormData = { ...formData, customTip: e.target.value };
                            setFormData(newFormData);
                            updateState(newFormData, selectedExtras);
                          }}
                          placeholder="Enter custom tip amount"
                        />
                      </div>
                    )}
                  </div>
                  
                  <NavigationButtons />
                </CardContent>
              </Card>
            );
            
          case 'review':
            return (
              <Card key={stepNumber} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    {renderSectionNumber(stepNumber)}
                    Review & Submit
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
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={previousStep}
                        className="flex items-center"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex items-center"
                        disabled={createBookingMutation.isPending}
                      >
                        {createBookingMutation.isPending ? 'Creating Booking...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            
          default:
            return null;
        }
      })}
    </form>
  );
}
