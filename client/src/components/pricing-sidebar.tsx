import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calculator, ShieldCheck } from "lucide-react";
import { SERVICE_DATA } from "@/lib/booking-utils";

interface PricingSidebarProps {
  formData: any;
  selectedExtras: any[];
  pricing: {
    basePrice: number;
    extrasTotal: number;
    tipAmount: number;
    subtotal: number;
    total: number;
  };
}

export default function PricingSidebar({ formData, selectedExtras, pricing }: PricingSidebarProps) {
  const serviceName = formData.serviceType 
    ? SERVICE_DATA[formData.serviceType as keyof typeof SERVICE_DATA]?.name 
    : 'Select a service';

  return (
    <div className="sticky top-5">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-primary flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span>Service:</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span>Duration:</span>
            <span className="font-medium">{formData.duration || '-'} hours</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span>Base Price:</span>
            <span className="font-medium">£{pricing.basePrice.toFixed(2)}</span>
          </div>
          
          {pricing.extrasTotal > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span>Selected Extras:</span>
              <span className="font-medium">£{pricing.extrasTotal.toFixed(2)}</span>
            </div>
          )}
          
          {pricing.tipAmount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span>Tip:</span>
              <span className="font-medium">£{pricing.tipAmount.toFixed(2)}</span>
            </div>
          )}
          
          {(pricing.extrasTotal > 0 || pricing.tipAmount > 0) && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span>Subtotal:</span>
              <span className="font-medium">£{pricing.subtotal.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-3 border-t-2 border-primary font-semibold text-lg text-primary">
            <span>Total:</span>
            <span className="animate-pulse">£{pricing.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-primary flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Why Choose Us?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Fully insured & bonded</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>100% satisfaction guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Professional trained staff</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Eco-friendly products</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Flexible scheduling</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
