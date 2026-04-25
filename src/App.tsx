import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home.tsx";
import Biometrics from "./pages/Biometrics.tsx";
import ModulePlaceholder from "./pages/ModulePlaceholder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/biometrics" element={<Biometrics />} />
          <Route
            path="/engine"
            element={
              <ModulePlaceholder
                title="The Engine Box"
                tagline="Cardiorespiratory · ACSM 12th Ed."
                upcoming={["Rockport 1-Mile Walk Test", "Cooper 12-Minute Run Test"]}
              />
            }
          />
          <Route
            path="/fuel"
            element={
              <ModulePlaceholder
                title="The Fuel Box"
                tagline="Nutrition · PAGA 2018 (2nd Ed.)"
                upcoming={["EXW 150 Resting Metabolic Rate", "Dietary Guidelines for Americans (DGA)"]}
              />
            }
          />
          <Route
            path="/safety"
            element={
              <ModulePlaceholder
                title="The Safety Box"
                tagline="Pre-participation Screening"
                upcoming={["PAR-Q+ Screening", "Senior Fitness Test Battery"]}
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
