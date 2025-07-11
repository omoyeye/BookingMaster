import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookingForm from "@/components/booking-form";
import PricingSidebar from "@/components/pricing-sidebar";

export default function BookingPage() {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({});
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [pricing, setPricing] = useState({
    basePrice: 0,
    extrasTotal: 0,
    tipAmount: 0,
    subtotal: 0,
    total: 0
  });

  // Memoize callback functions to prevent infinite loops
  const handlePricingChange = useCallback((newPricing: any) => {
    setPricing(newPricing);
  }, []);

  const handleExtrasChange = useCallback((newExtras: any[]) => {
    setSelectedExtras(newExtras);
  }, []);

  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(newFormData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Main Form Column */}
          <div className="lg:col-span-8">
            <BookingForm
              onPricingChange={handlePricingChange}
              onExtrasChange={handleExtrasChange}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-4">
            <PricingSidebar
              formData={formData}
              selectedExtras={selectedExtras}
              pricing={pricing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
