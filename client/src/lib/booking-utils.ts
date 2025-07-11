export const SERVICE_DATA = {
  general: { name: 'General / Standard Cleaning', baseRate: 25, minDuration: 2, minNotice: 2 },
  deep: { name: 'Deep Cleaning', baseRate: 35, minDuration: 3, minNotice: 3 },
  tenancy: { name: 'End of Tenancy Cleaning', baseRate: 45, minDuration: 4, minNotice: 7 },
  airbnb: { name: 'AirBnB Cleaning', baseRate: 30, minDuration: 2, minNotice: 1 },
  jet: { name: 'Jet Washing / Garden Cleaning', baseRate: 40, minDuration: 2, minNotice: 2 },
  commercial: { name: 'Commercial Cleaning', baseRate: 50, minDuration: 3, minNotice: 3 }
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
  if (!service || !formData.duration) {
    return { basePrice: 0, extrasTotal: 0, tipAmount: 0, subtotal: 0, total: 0 };
  }

  const basePrice = service.baseRate * formData.duration;
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.price), 0);
  const subtotal = basePrice + extrasTotal;
  
  let tipAmount = 0;
  if (formData.tipPercentage === 'custom') {
    tipAmount = parseFloat(formData.customTip) || 0;
  } else {
    tipAmount = subtotal * (parseInt(formData.tipPercentage) / 100);
  }

  const total = subtotal + tipAmount;

  return {
    basePrice,
    extrasTotal,
    tipAmount,
    subtotal,
    total
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
}
