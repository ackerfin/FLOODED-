import { useEffect } from "react"; // 1. THÊM IMPORT NÀY
import { BleClient } from "@capacitor-community/bluetooth-le"; // 2. THÊM IMPORT NÀY

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

import Home from "./pages/Home";
import Guides from "./pages/Guides";
import CommunityBoard from "./pages/CommunityBoard";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Compass from "./pages/Compass";
import Checklist from "./pages/Checklist";
import More from "./pages/More";
import QuotesPage from "./pages/QuotesPage";
import RemoteSOS from "./pages/RemoteSOS";
import RescueMode from "./pages/RescueMode";
import RegisterRescue from "./pages/RegisterRescue";
import RegisterRescueSuccess from "./pages/RegisterRescueSuccess";
import RegisterRescueStatus from "./pages/RegisterRescueStatus";
import AdminRescueRegistrations from "./pages/AdminRescueRegistrations";
import RescueLogin from "./pages/RescueLogin";
import RescueDashboard from "./pages/RescueDashboard";
import RescueTeamDashboard from "./pages/RescueTeamDashboard";
import CommandLogin from "./pages/CommandLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 3. THÊM ĐOẠN KHỞI TẠO BLUETOOTH NÀY
  useEffect(() => {
    const initEmergencyBluetooth = async () => {
      try {
        // Gọi hàm khởi tạo để kích hoạt module Bluetooth native dưới iOS
        await BleClient.initialize();
        console.log("Capacitor BleClient initialized successfully!");
      } catch (error) {
        console.error("Failed to initialize Bluetooth LE:", error);
      }
    };

    initEmergencyBluetooth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/nearby" element={<CommunityBoard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/compass" element={<Compass />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/more" element={<More />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/remote-sos" element={<RemoteSOS />} />
              <Route path="/rescue" element={<RescueMode />} />
              <Route path="/register-rescue" element={<RegisterRescue />} />
              <Route path="/register-rescue/success" element={<RegisterRescueSuccess />} />
              <Route path="/register-rescue/status" element={<RegisterRescueStatus />} />
              <Route path="/admin/rescue-registrations" element={<AdminRescueRegistrations />} />
              <Route path="/rescue-login" element={<RescueLogin />} />
              <Route path="/rescue-dashboard" element={<RescueDashboard />} />
              <Route path="/rescue-team" element={<RescueTeamDashboard />} />
              <Route path="/command-login" element={<CommandLogin />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
