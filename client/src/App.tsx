import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BookingPage from "@/pages/booking";
import BookingConfirmation from "@/pages/booking-confirmation";
import AdminDashboard from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import AdminCreate from "@/pages/admin-create";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BookingPage} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/booking-confirmation/:bookingId" component={BookingConfirmation} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/create" component={AdminCreate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
