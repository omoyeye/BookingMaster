import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookingForm from "@/components/booking-form";
import PricingSidebar from "@/components/pricing-sidebar";
import ErrorBoundary from "@/components/error-boundary";

export default function BookingPage() {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({});
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [pricing, setPricing] = useState({
    basePrice: 0,
    baseDuration: 0,
    extrasTotal: 0,
    extrasDuration: 0,
    tipAmount: 0,
    subtotal: 0,
    total: 0,
    totalDuration: 0
  });

  // Memoize callback functions to prevent infinite loops
  const handlePricingChange = useCallback((newPricing: any) => {
    setPricing(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newPricing)) {
        return newPricing;
      }
      return prev;
    });
  }, []);

  const handleExtrasChange = useCallback((newExtras: any[]) => {
    setSelectedExtras(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newExtras)) {
        return newExtras;
      }
      return prev;
    });
  }, []);

  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newFormData)) {
        return newFormData;
      }
      return prev;
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Main Form Column */}
            <div className="lg:col-span-8">
              <ErrorBoundary>
                <BookingForm
                  onPricingChange={handlePricingChange}
                  onExtrasChange={handleExtrasChange}
                  onFormDataChange={handleFormDataChange}
                />
              </ErrorBoundary>
            </div>

            {/* Pricing Sidebar */}
            <div className="lg:col-span-4">
              <ErrorBoundary>
                <PricingSidebar
                  formData={formData}
                  selectedExtras={selectedExtras}
                  pricing={pricing}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
