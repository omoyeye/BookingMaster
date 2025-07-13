export const SERVICE_DATA = {
  general: { name: 'General / Standard Cleaning', baseRate: 20, minDuration: 2, minNotice: 2 },
  deep: { name: 'Deep Cleaning', baseRate: 30, minDuration: 3, minNotice: 3 },
  tenancy: { name: 'End of Tenancy Cleaning', baseRate: 30, minDuration: 4, minNotice: 7 },
  airbnb: { name: 'AirBnB Cleaning', baseRate: 20, minDuration: 2, minNotice: 1, bedroomBased: true },
  jet: { name: 'Jet Washing / Garden Cleaning', baseRate: 0, minDuration: 2, minNotice: 2, quoteBased: true },
  commercial: { name: 'Commercial Cleaning', baseRate: 0, minDuration: 3, minNotice: 3, quoteBased: true }
};

export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' }
];

export const DURATION_OPTIONS = [
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
  { value: 5, label: '5 hours' }
];

export const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' }
];

export const TIP_OPTIONS = [
  { value: '0', label: 'No Tip' },
  { value: '10', label: '10%' },
  { value: '15', label: '15%' },
  { value: '20', label: '20%' },
  { value: 'custom', label: 'Custom Amount' }
];

export function calculateMinDate(serviceType: string): string {
  const minNotice = SERVICE_DATA[serviceType as keyof typeof SERVICE_DATA]?.minNotice || 2;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minNotice);
  return minDate.toISOString().split('T')[0];
}

export function calculatePricing(formData: any, selectedExtras: any[]) {
  const service = SERVICE_DATA[formData.serviceType as keyof typeof SERVICE_DATA];
  if (!service) {
    return { 
      basePrice: 0, 
      baseDuration: 0, 
      extrasTotal: 0, 
      extrasDuration: 0, 
      tipAmount: 0, 
      subtotal: 0, 
      total: 0, 
      totalDuration: 0 
    };
  }

  let basePrice = 0;
  let baseDuration = 0;

  // Dynamic pricing for Deep Cleaning and End of Tenancy
  if (formData.serviceType === 'deep' || formData.serviceType === 'tenancy') {
    const bedrooms = parseInt(formData.bedrooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;
    const toilets = parseInt(formData.toilets) || 0;
    const livingRooms = parseInt(formData.livingRooms) || 0;
    const kitchen = parseInt(formData.kitchen) || 0;
    const utilityRoom = parseInt(formData.utilityRoom) || 0;
    const carpetCleaning = parseInt(formData.carpetCleaning) || 0;
    
    // Base pricing structure for room-based services
    const roomPricing = {
      bedroom: { price: 20, duration: 60 }, // £20 per hour
      bathroom: { price: 25, duration: 60 }, // £25 per hour  
      toilet: { price: 15, duration: 30 }, // £15 per 30 mins
      livingRoom: { price: 25, duration: 60 }, // £25 per hour (reception room)
      kitchen: { price: 25, duration: 60 }, // £25 per hour
      utilityRoom: { price: 15, duration: 30 }, // £15 per 30 mins
      carpetCleaning: { price: 35, duration: 60 }, // £35 per hour
    };
    
    // Calculate room-based pricing
    basePrice = (bedrooms * roomPricing.bedroom.price) + 
                (bathrooms * roomPricing.bathroom.price) + 
                (toilets * roomPricing.toilet.price) + 
                (livingRooms * roomPricing.livingRoom.price) +
                (kitchen * roomPricing.kitchen.price) +
                (utilityRoom * roomPricing.utilityRoom.price) +
                (carpetCleaning * roomPricing.carpetCleaning.price);
    
    baseDuration = (bedrooms * roomPricing.bedroom.duration) + 
                   (bathrooms * roomPricing.bathroom.duration) + 
                   (toilets * roomPricing.toilet.duration) + 
                   (livingRooms * roomPricing.livingRoom.duration) +
                   (kitchen * roomPricing.kitchen.duration) +
                   (utilityRoom * roomPricing.utilityRoom.duration) +
                   (carpetCleaning * roomPricing.carpetCleaning.duration);
    
    // Minimum base price for these services
    basePrice = Math.max(basePrice, 60); // Minimum £60
    baseDuration = Math.max(baseDuration, 120); // Minimum 2 hours
  } else {
    // Handle AirBnB special pricing
    if (formData.serviceType === 'airbnb') {
      const bedrooms = parseInt(formData.bedrooms?.toString() || '1');
      const duration = bedrooms + 1; // 1 bedroom = 2hrs, 2 bedrooms = 3hrs, etc.
      basePrice = 20 * duration; // £20/hour
      baseDuration = duration * 60; // Convert hours to minutes
    } else if (service.quoteBased) {
      // Handle other quote-based services
      const extrasTotal = selectedExtras.reduce((sum, extra) => {
        const quantity = extra.quantity || 1;
        return sum + (parseFloat(extra.price) * quantity);
      }, 0);
      return {
        basePrice: 0,
        baseDuration: 0,
        extrasTotal,
        extrasDuration: 0,
        tipAmount: 0,
        subtotal: extrasTotal,
        total: extrasTotal,
        totalDuration: 0,
        quoteBased: true
      };
    } else {
      // Standard pricing for other services
      basePrice = service.baseRate * (formData.duration || 1);
      baseDuration = (formData.duration || 1) * 60; // Convert hours to minutes
    }
  }

  // Calculate extras total and duration (with quantities)
  const extrasTotal = selectedExtras.reduce((sum, extra) => {
    const quantity = extra.quantity || 1;
    return sum + (parseFloat(extra.price) * quantity);
  }, 0);
  const extrasDuration = selectedExtras.reduce((sum, extra) => {
    const quantity = extra.quantity || 1;
    // Parse duration from extra (format: "1hr 30mins" or "45mins" or "1hr")
    const durationStr = extra.duration || '0';
    let minutes = 0;
    
    if (durationStr.includes('hr')) {
      const hours = parseInt(durationStr.match(/(\d+)hr/)?.[1] || '0');
      minutes += hours * 60;
    }
    if (durationStr.includes('mins')) {
      const mins = parseInt(durationStr.match(/(\d+)mins/)?.[1] || '0');
      minutes += mins;
    }
    
    return sum + (minutes * quantity);
  }, 0);
  
  const subtotal = basePrice + extrasTotal;
  
  let tipAmount = 0;
  if (formData.tipPercentage === 'custom') {
    tipAmount = parseFloat(formData.customTip) || 0;
  } else if (formData.tipPercentage && formData.tipPercentage !== '0') {
    tipAmount = subtotal * (parseInt(formData.tipPercentage) / 100);
  }

  const total = subtotal + tipAmount;
  const totalDuration = baseDuration + extrasDuration;

  return {
    basePrice,
    baseDuration,
    extrasTotal,
    extrasDuration,
    tipAmount,
    subtotal,
    total,
    totalDuration
  };
}

export function saveFormData(data: any) {
  localStorage.setItem('bookingFormData', JSON.stringify(data));
}

export function loadFormData() {
  try {
    const saved = localStorage.getItem('bookingFormData');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function clearFormData() {
  localStorage.removeItem('bookingFormData');
  localStorage.removeItem('bookingCompleted');
}

export function markBookingCompleted() {
  localStorage.setItem('bookingCompleted', 'true');
}

export function isBookingCompleted() {
  return localStorage.getItem('bookingCompleted') === 'true';
}

export function getInitialFormData() {
  // Don't load saved data if booking was just completed
  if (isBookingCompleted()) {
    clearFormData();
    return {
      serviceType: '',
      frequency: 'once',
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
  
  return loadFormData() || {
    serviceType: '',
    frequency: 'once',
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
