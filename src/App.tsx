import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EquipmentDetail from "./pages/EquipmentDetail";
import StationComparison from "./pages/StationComparison";
import NotFound from "./pages/NotFound";

// Simplified App structure for FastHTML compatibility
// Removed React Query and TooltipProvider as they're React-specific
const App = () => (
  <>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/comparison" element={<StationComparison />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
