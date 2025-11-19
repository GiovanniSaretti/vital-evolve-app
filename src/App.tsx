import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Meals from "./pages/Meals";
import Workouts from "./pages/Workouts";
import Medications from "./pages/Medications";
import Measurements from "./pages/Measurements";
import MoodLog from "./pages/MoodLog";
import ProfessionalRegister from "./pages/ProfessionalRegister";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import CreatePrescription from "./pages/CreatePrescription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/mood" element={<MoodLog />} />
          <Route path="/professional-register" element={<ProfessionalRegister />} />
          <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
          <Route path="/patient/:patientId/prescribe" element={<CreatePrescription />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
