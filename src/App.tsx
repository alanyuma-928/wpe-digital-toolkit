import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherMonitor from "@/components/WeatherMonitor";
import Home from "./pages/Home.tsx";
import Biometrics from "./pages/Biometrics.tsx";
import Engine from "./pages/Engine.tsx";
import Fuel from "./pages/Fuel.tsx";
import Safety from "./pages/Safety.tsx";
import NotFound from "./pages/NotFound.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WeatherProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <WeatherMonitor />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/biometrics" element={<Biometrics />} />
            <Route path="/engine" element={<Engine />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/safety" element={<Safety />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </WeatherProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
