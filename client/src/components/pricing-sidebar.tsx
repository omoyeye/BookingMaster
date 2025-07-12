import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calculator, ShieldCheck } from "lucide-react";
import { SERVICE_DATA } from "@/lib/booking-utils";

interface PricingSidebarProps {
  formData: any;
  selectedExtras: any[];
  pricing: {
    basePrice: number;
    baseDuration?: number;
    extrasTotal: number;
    extrasDuration?: number;
    tipAmount: number;
    subtotal: number;
    total: number;
    totalDuration?: number;
    quoteBased?: boolean;
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
            <span className="font-medium">
              {pricing.totalDuration ? 
                `${Math.floor(pricing.totalDuration / 60)}h ${pricing.totalDuration % 60 > 0 ? `${pricing.totalDuration % 60}m` : ''}`.trim() :
                (formData.serviceType === 'deep' || formData.serviceType === 'tenancy') ? 
                  'Dynamic (based on rooms)' :
                  formData.serviceType === 'airbnb' ?
                    `${formData.duration || 2} hours (bedroom-based)` :
                    `${formData.duration || '-'} hours`
              }
            </span>
          </div>
          
          {pricing.basePrice > 0 && (
            <div className="py-2 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span>Base Price:</span>
                <span className="font-medium">£{pricing.basePrice.toFixed(2)}</span>
              </div>
              {(formData.serviceType === 'deep' || formData.serviceType === 'tenancy') && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {formData.bedrooms > 0 && <div>• {formData.bedrooms} Bedroom{formData.bedrooms > 1 ? 's' : ''} (£20/hr each)</div>}
                  {formData.bathrooms > 0 && <div>• {formData.bathrooms} Bathroom{formData.bathrooms > 1 ? 's' : ''} (£25/hr each)</div>}
                  {formData.toilets > 0 && <div>• {formData.toilets} Cloakroom Toilet{formData.toilets > 1 ? 's' : ''} (£15/30min each)</div>}
                  {formData.livingRooms > 0 && <div>• {formData.livingRooms} Reception Room{formData.livingRooms > 1 ? 's' : ''} (£25/hr each)</div>}
                  {formData.kitchen > 0 && <div>• {formData.kitchen} Kitchen{formData.kitchen > 1 ? 's' : ''} (£25/hr each)</div>}
                  {formData.utilityRoom > 0 && <div>• {formData.utilityRoom} Utility Room{formData.utilityRoom > 1 ? 's' : ''} (£15/30min each)</div>}
                  {formData.carpetCleaning > 0 && <div>• {formData.carpetCleaning} Carpet Cleaning area{formData.carpetCleaning > 1 ? 's' : ''} (£35/hr each)</div>}
                </div>
              )}
            </div>
          )}
          
          {(pricing as any).quoteBased && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span>Service:</span>
              <span className="font-medium text-primary">Quote Required</span>
            </div>
          )}
          
          {selectedExtras.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Selected Extras:</span>
                <span className="font-medium">£{pricing.extrasTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                {selectedExtras.map((extra: any, index: number) => {
                  const quantity = extra.quantity || 1;
                  const totalPrice = parseFloat(extra.price) * quantity;
                  return (
                    <div key={index} className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>• {extra.name} {quantity > 1 ? `(x${quantity})` : ''} {extra.duration && `(${extra.duration})`}</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
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
