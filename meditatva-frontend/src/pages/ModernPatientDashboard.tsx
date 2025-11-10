import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EnhancedThemeToggle } from "@/components/EnhancedThemeToggle";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Chatbot } from "@/components/Chatbot";
import { MedicalCabinet } from "@/components/MedicalCabinet";
import { AppointmentsSection } from "@/components/AppointmentsSection";
import { MedicineOrders } from "@/components/MedicineOrders";
import { HealthReminders } from "@/components/HealthReminders";
import { NearbyMedicalStoresPage } from "@/pages/NearbyMedicalStoresPage";
import FindMedicineEnhanced from "@/pages/FindMedicineEnhanced";
import {
  Home, Calendar, ShoppingCart, Bell, FolderOpen,
  MapPin, MessageCircle, User, LogOut, Menu, X,
  Pill, Camera, Search, Activity, Heart, ChevronRight,
  Scan, Zap, TrendingUp, AlertCircle, CheckCircle2, Settings
} from "lucide-react";
import { toast } from "sonner";

type Section = "home" | "appointments" | "orders" | "cabinet" | "nearby" | "find-medicine" | "chat" | "settings";

const ModernPatientDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("nearby");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Ensure demo auth for patient (enable real auth in production)
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "patient") {
      // auto-set for demo
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "patient");
    }
  }, []);

  const menuItems = [
    { id: "home", icon: Home, label: "Dashboard", gradient: "from-blue-500 to-cyan-400" },
    { id: "nearby", icon: MapPin, label: "Nearby Stores", gradient: "from-blue-500 to-cyan-400" },
    { id: "find-medicine", icon: Search, label: "Find Medicine", gradient: "from-purple-500 to-pink-400" },
    { id: "orders", icon: ShoppingCart, label: "Medicine Orders", gradient: "from-green-500 to-emerald-400" },
    { id: "cabinet", icon: FolderOpen, label: "Medical Cabinet", gradient: "from-orange-500 to-amber-400" },
    { id: "appointments", icon: Calendar, label: "Appointments", gradient: "from-indigo-500 to-violet-400" },
    { id: "chat", icon: MessageCircle, label: "AI Consultation", gradient: "from-rose-500 to-pink-400" },
    { id: "settings", icon: Settings, label: "Settings", gradient: "from-slate-500 to-gray-400" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <motion.aside
          className={`${sidebarCollapsed ? 'w-20' : 'w-72'} h-screen fixed left-0 top-0 transition-all duration-300`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px) saturate(180%)'
            }}
            className="flex flex-col h-full p-6"
          >
            {/* Logo - Fixed at top */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#3B82F6 0%,#60A5FA 100%)'}}>
                  <Pill className="h-6 w-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediTatva</h1>
                    <p className="text-xs text-slate-500 font-medium">Patient Portal</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent hover:scrollbar-thumb-blue-400"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#93C5FD transparent'
              }}
            >
              {menuItems.map((item) => {
                const Icon = item.icon as any;
                const isActive = activeSection === item.id;
                return (
                  <div key={item.id} className="relative group">
                    <motion.button
                      onClick={() => setActiveSection(item.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all duration-300 relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-slate-700 hover:bg-white/60 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Glowing accent line for active item */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-white/20' : 'bg-gradient-to-br ' + item.gradient
                      }`}> 
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                            {item.label}
                          </p>
                        </div>
                      )}
                      
                      {!sidebarCollapsed && isActive && (
                        <ChevronRight className="h-4 w-4 text-white" />
                      )}
                    </motion.button>
                    
                    {/* Tooltip for collapsed mode */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Logout Button - Fixed at bottom */}
            <div className="mt-auto pt-6 flex-shrink-0 border-t border-slate-200/50">
              <Button className="w-full bg-white/60 text-rose-600 border-2 border-rose-200 hover:bg-rose-50" onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Logout</span>}
                </div>
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
          <motion.header className="sticky top-4 mx-6 mb-6 z-50 rounded-2xl bg-white/60 backdrop-blur-lg shadow-lg" style={{border:'1px solid rgba(255,255,255,0.5)'}}>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hover:bg-blue-500/10">
                  {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{menuItems.find(m=>m.id===activeSection)?.label}</p>
                    <p className="text-xs text-slate-500">MediTatva Patient Portal</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Active</span>
                </div>
                <Button variant="ghost" size="sm" className="relative h-11 w-11 rounded-xl hover:bg-blue-500/10"><Bell className="h-5 w-5" /></Button>
                <EnhancedThemeToggle />
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-blue-50">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=patient" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold">JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.main className="px-6 pb-8">
            {/* content switch */}
            <AnimatePresence mode="wait">
              {activeSection === 'home' && (
                <motion.div key="home" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">Welcome back, John!</h2>
                      <p className="text-slate-500 mt-1">Here's your health overview</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="p-5 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-blue-100">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">3</p>
                            <p className="text-sm text-slate-500">Upcoming</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-5 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-green-100">
                            <ShoppingCart className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">5</p>
                            <p className="text-sm text-slate-500">Orders</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-5 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-orange-100">
                            <Bell className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">12</p>
                            <p className="text-sm text-slate-500">Reminders</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-5 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-indigo-100">
                            <Activity className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">87%</p>
                            <p className="text-sm text-slate-500">Health Score</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'appointments' && (
                <motion.div key="appointments" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <AppointmentsSection />
                </motion.div>
              )}

              {activeSection === 'orders' && (
                <motion.div key="orders" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <MedicineOrders />
                </motion.div>
              )}

              {activeSection === 'cabinet' && (
                <motion.div key="cabinet" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <MedicalCabinet />
                </motion.div>
              )}

              {activeSection === 'nearby' && (
                <motion.div key="nearby" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <NearbyMedicalStoresPage />
                </motion.div>
              )}

              {activeSection === 'find-medicine' && (
                <motion.div key="find-medicine" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <FindMedicineEnhanced />
                </motion.div>
              )}

              {activeSection === 'chat' && (
                <motion.div key="chat" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">AI Health Assistant</h2>
                      <p className="text-slate-500 mt-1">Get instant health advice and consultation</p>
                    </div>
                    <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                      <div className="text-center">
                        <MessageCircle className="h-20 w-20 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Chatbot Coming Soon</h3>
                        <p className="text-slate-600 mb-6">
                          Our AI-powered health assistant will provide personalized health advice, answer your medical questions, and help you manage your wellness journey.
                        </p>
                        <Button 
                          onClick={() => setShowChat(true)}
                          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Open Chat Assistant
                        </Button>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeSection === 'settings' && (
                <motion.div key="settings" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                      <p className="text-slate-500 mt-1">Manage your account and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 bg-white">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1">Profile Settings</h3>
                            <p className="text-sm text-slate-500 mb-4">Update your personal information and contact details</p>
                            <Button size="sm" variant="outline">Edit Profile</Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1">Notifications</h3>
                            <p className="text-sm text-slate-500 mb-4">Manage notification preferences and alerts</p>
                            <Button size="sm" variant="outline">Configure</Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center">
                            <Settings className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1">Appearance</h3>
                            <p className="text-sm text-slate-500 mb-4">Customize theme and display preferences</p>
                            <div className="mt-3">
                              <EnhancedThemeToggle />
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-400 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1">Privacy & Security</h3>
                            <p className="text-sm text-slate-500 mb-4">Manage your privacy settings and security options</p>
                            <Button size="sm" variant="outline">Manage</Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>

      <AnimatePresence>
        {showChat && <Chatbot onClose={() => setShowChat(false)} />}
      </AnimatePresence>

      {showScanner && (
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowScanner(false)}>
          <motion.div className="bg-white rounded-xl p-6 max-w-md w-full" initial={{scale:0.95}} animate={{scale:1}} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Scan Prescription</h3>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center my-4">Camera placeholder</div>
            <div className="flex gap-3">
              <Button className="flex-1">Capture</Button>
              <Button variant="outline" className="flex-1" onClick={()=>setShowScanner(false)}>Cancel</Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {!showChat && (
        <motion.button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center z-40" whileHover={{scale:1.05}} onClick={()=>setShowChat(true)}>
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default ModernPatientDashboard;
