import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { BrandProvider } from "@/hooks/use-brand";
import Landing from "@/pages/Landing";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import VehicleDetail from "@/pages/driver/VehicleDetail";
import VehicleInspection from "@/pages/driver/VehicleInspection";
import FuelEntry from "@/pages/driver/FuelEntry";
import ManagerLogin from "@/pages/manager/ManagerLogin";
import ManagerDashboard from "@/pages/manager/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/driver" component={DriverDashboard} />
      <Route path="/driver/vehicle/:id" component={VehicleDetail} />
      <Route path="/driver/inspection/:id" component={VehicleInspection} />
      <Route path="/driver/fuel/:id" component={FuelEntry} />
      <Route path="/manager/login" component={ManagerLogin} />
      <Route path="/manager" component={ManagerDashboard} />
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
