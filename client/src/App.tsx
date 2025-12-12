import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { BrandProvider } from "@/hooks/use-brand";
import Landing from "@/pages/Landing";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import VehicleInspection from "@/pages/driver/VehicleInspection";
import FuelEntry from "@/pages/driver/FuelEntry";
import Settings from "@/pages/manager/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/driver" component={DriverDashboard} />
      <Route path="/driver/inspection/:id" component={VehicleInspection} />
      <Route path="/driver/fuel/:id" component={FuelEntry} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/manager/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <Router />
        <Toaster />
      </BrandProvider>
    </QueryClientProvider>
  );
}

export default App;
