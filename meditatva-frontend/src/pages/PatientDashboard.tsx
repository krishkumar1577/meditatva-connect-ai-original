import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/Chatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocationDisplay } from "@/components/LocationDisplay";
import { NearbyPharmacyFinder } from "@/components/NearbyPharmacyFinder";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, MapPin, MessageCircle, Star, Phone, Navigation,
  Clock, Package, Heart, Bell, User, LogOut, Pill, Camera, 
  Calendar, AlertCircle, CheckCircle, XCircle, Sparkles, TrendingUp
} from "lucide-react";
import { mockPharmacies, mockMedicines, mockChatMessages, mockSubstitutes, mockRefillReminders } from "@/lib/mockData";
import { toast } from "sonner";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    // No need for auth check here - ProtectedRoute handles it
    // This component only renders if user is authenticated with proper role
  }, []);

  const handleLogout = () => {
    logout();
    // AuthContext will handle navigation to login
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"...`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] relative overflow-hidden">
      {/* Premium Background with Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220]" />
        
        {/* Animated Gradient Lines */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Radial Glows */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar - Premium Glass Effect */}
      <motion.nav 
        className="sticky top-0 z-40 border-b border-white/5"
        style={{
          background: 'rgba(11, 18, 32, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                MediTatva
              </h1>
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowNearbyFinder(true)}
                  className="gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    boxShadow: '0 0 20px rgba(20, 184, 166, 0.15)',
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden md:inline">Find Nearby Stores</span>
                </Button>
              </motion.div>
              <LocationDisplay variant="patient" showFullAddress={false} />
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-white/5"
                >
                  <Bell className="h-5 w-5 text-gray-400" />
                  <motion.span 
                    className="absolute top-1 right-1 h-2 w-2 bg-cyan-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="hover:bg-white/5">
                  <User className="h-5 w-5 text-gray-400" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleLogout} variant="ghost" size="icon" className="hover:bg-white/5">
                  <LogOut className="h-5 w-5 text-gray-400" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Welcome Section with Animation */}
        <motion.div 
          className="mb-8 sm:mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Welcome back, John!
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">Find medicines near you instantly</p>
        </motion.div>

        {/* Search Section - Premium Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card 
            className="p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-600/50" />
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search for medicines... (e.g., Paracetamol)"
                  className="pl-10 bg-[#111827] border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                />
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={handleSearch} 
                  className="w-full sm:w-auto"
                  style={{
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(20, 184, 166, 0.5)',
                    boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
                  }}
                >
                  Search
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={() => setShowScanner(true)} 
                  variant="outline" 
                  className="w-full sm:w-auto gap-2 border-white/10 hover:bg-white/5 text-white"
                >
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">MediTatva Lens</span>
                  <span className="sm:hidden">Scan</span>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Smart Refill Reminders - Premium Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Card 
            className="p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/50 to-pink-600/50" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Smart Refill Reminders
              </h3>
              <Badge 
                className="w-fit"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  color: '#a78bfa',
                }}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            
            <motion.div 
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {mockRefillReminders.map((reminder) => (
                <motion.div 
                  key={reminder.id} 
                  className="p-4 rounded-lg bg-[#111827]/80 border border-white/5"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, borderColor: 'rgba(20, 184, 166, 0.2)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-semibold text-white">{reminder.medicineName}</p>
                        {reminder.status === "due-today" && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 text-xs bg-red-500/20 text-red-400 border-red-500/30"
                          >
                            Due Today
                          </Badge>
                        )}
                        {reminder.status === "overdue" && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 text-xs bg-red-600/30 text-red-300 border-red-600/50"
                          >
                            Overdue
                          </Badge>
                        )}
                        {reminder.status === "due-soon" && (
                          <Badge 
                            className="h-5 text-xs"
                            style={{
                              background: 'rgba(147, 51, 234, 0.2)',
                              border: '1px solid rgba(147, 51, 234, 0.3)',
                              color: '#a78bfa',
                            }}
                          >
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {reminder.pharmacy} • Next refill: {new Date(reminder.nextRefill).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-white/10 hover:bg-white/5 text-gray-300 text-xs sm:text-sm"
                        >
                          <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                          Remind
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          size="sm"
                          className="text-xs sm:text-sm"
                          style={{
                            background: 'rgba(17, 24, 39, 0.8)',
                            border: '1px solid rgba(20, 184, 166, 0.5)',
                            boxShadow: '0 0 15px rgba(20, 184, 166, 0.15)',
                          }}
                        >
                          Reserve Now
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Pharmacy List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Nearby Pharmacies</h3>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 hover:bg-white/5 text-gray-300 w-full sm:w-auto"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Map View
                </Button>
              </motion.div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {mockPharmacies.map((pharmacy, index) => (
                <motion.div
                  key={pharmacy.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="p-4 sm:p-6 cursor-pointer relative overflow-hidden"
                    style={{
                      background: 'rgba(17, 24, 39, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: selectedPharmacy === pharmacy.id ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    onClick={() => setSelectedPharmacy(pharmacy.id)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-600/50" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2 text-white">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-1 flex-wrap">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">{pharmacy.address}</span>
                          <span className="text-cyan-400">• {pharmacy.distance}</span>
                        </p>
                      </div>
                      <Badge 
                        variant={pharmacy.isOpen ? "default" : "secondary"} 
                        className={pharmacy.isOpen 
                          ? "bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0" 
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30 flex-shrink-0"}
                      >
                        {pharmacy.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-white">{pharmacy.rating}</span>
                        <span className="text-gray-400">({pharmacy.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        Open until 10 PM
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <motion.div 
                        className="flex-1 min-w-[120px]"
                        whileHover={{ scale: 1.03 }} 
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          size="sm" 
                          className="w-full text-xs sm:text-sm"
                          style={{
                            background: 'rgba(17, 24, 39, 0.8)',
                            border: '1px solid rgba(20, 184, 166, 0.5)',
                            boxShadow: '0 0 15px rgba(20, 184, 166, 0.15)',
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          View Medicines
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowChat(true);
                          }}
                          className="border-white/10 hover:bg-white/5 text-gray-300 text-xs sm:text-sm"
                        >
                          <MessageCircle className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Chat</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-white/10 hover:bg-white/5 text-gray-300 text-xs sm:text-sm"
                        >
                          <Phone className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Call</span>
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* AI Substitutes */}
            <motion.div variants={fadeInUp}>
              <Card 
                className="p-4 sm:p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/50 to-pink-600/50" />
                
                <h3 className="text-lg font-bold mb-4 text-white">AI Substitute Suggestions</h3>
                <div className="space-y-3">
                  {mockSubstitutes.slice(0, 2).map((sub) => (
                    <motion.div 
                      key={sub.id} 
                      className="p-3 rounded-lg bg-[#111827]/80 border border-white/5"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(147, 51, 234, 0.2)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-sm text-white">{sub.substitute}</p>
                          <p className="text-xs text-gray-400">Alternative to {sub.original}</p>
                        </div>
                        <Badge 
                          className="flex-shrink-0"
                          style={{
                            background: 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            color: '#a78bfa',
                          }}
                        >
                          {sub.savings} off
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-cyan-400">${sub.price}</p>
                      <p className="text-xs text-gray-400 mt-1">{sub.pharmacy}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button 
                    className="w-full mt-4"
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(147, 51, 234, 0.5)',
                      boxShadow: '0 0 15px rgba(147, 51, 234, 0.15)',
                    }}
                  >
                    View All Alternatives
                  </Button>
                </motion.div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
              <Card 
                className="p-4 sm:p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-600/50" />
                
                <h3 className="text-lg font-bold mb-4 text-white">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: Heart, label: "Saved Pharmacies" },
                    { icon: Package, label: "My Reservations" },
                    { icon: Navigation, label: "Get Directions" }
                  ].map((action, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-white/10 hover:bg-white/5 text-gray-300"
                      >
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Health Tips */}
            <motion.div variants={fadeInUp}>
              <Card 
                className="p-4 sm:p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block mb-2"
                >
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2 text-white">Health Tip</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Always check medicine expiry dates and store them in a cool, dry place away from direct sunlight.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* MediTatva Lens Scanner Modal - Premium Design */}
        <AnimatePresence>
          {showScanner && (
            <motion.div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card 
                  className="overflow-hidden"
                  style={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                  }}
                >
                  <div 
                    className="p-4 flex justify-between items-center relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                      borderBottom: '1px solid rgba(20, 184, 166, 0.3)',
                    }}
                  >
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      MediTatva Lens - AI Scanner
                    </h3>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowScanner(false)} 
                        className="text-white hover:bg-white/10"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="p-6">
                    <div className="bg-[#0B1220] rounded-lg h-64 flex items-center justify-center mb-4 border-2 border-dashed border-cyan-500/30 relative overflow-hidden">
                      {/* Animated Scan Line */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                        animate={{ y: [0, 256, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      
                      <div className="text-center z-10">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Camera className="h-16 w-16 mx-auto mb-4 text-cyan-400" />
                        </motion.div>
                        <p className="text-gray-400 mb-2">Point camera at medicine packaging</p>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            style={{
                              background: 'rgba(17, 24, 39, 0.8)',
                              border: '1px solid rgba(20, 184, 166, 0.5)',
                              boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
                            }}
                          >
                            Start Camera
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Simulated Scan Result */}
                    <motion.div 
                      className="rounded-lg p-4 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </motion.div>
                        <span className="font-semibold text-white">Medicine Identified!</span>
                      </div>
                      <h4 className="text-lg font-bold mb-2 text-white">Paracetamol 500mg</h4>
                      <p className="text-sm text-gray-400 mb-4">Common pain reliever and fever reducer</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            className="w-full"
                            style={{
                              background: 'rgba(17, 24, 39, 0.8)',
                              border: '1px solid rgba(20, 184, 166, 0.5)',
                              boxShadow: '0 0 15px rgba(20, 184, 166, 0.15)',
                            }}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Find Near Me
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button 
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5 text-gray-300"
                          >
                            View Substitutes
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Overlay - Premium Design */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl h-[600px] flex flex-col"
              >
                <Card 
                  className="flex flex-col h-full overflow-hidden"
                  style={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                  }}
                >
                  <div 
                    className="p-4 flex justify-between items-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                      borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
                    }}
                  >
                    <h3 className="text-white font-bold">Chat with Pharmacy</h3>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowChat(false)} 
                        className="text-white hover:bg-white/10"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1220]/50">
                    {mockChatMessages.map((msg, index) => (
                      <motion.div 
                        key={msg.id} 
                        className={`flex ${msg.isPatient ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div 
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.isPatient 
                              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                              : "bg-[#111827] text-gray-200 border border-white/10"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isPatient ? 'opacity-80' : 'text-gray-500'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div 
                    className="p-4 border-t border-white/10 flex-shrink-0"
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                    }}
                  >
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type your message..." 
                        className="bg-[#111827] border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      />
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          style={{
                            background: 'rgba(17, 24, 39, 0.8)',
                            border: '1px solid rgba(20, 184, 166, 0.5)',
                            boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
                          }}
                        >
                          Send
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nearby Pharmacy Finder Modal */}
      <AnimatePresence>
        {showNearbyFinder && (
          <NearbyPharmacyFinder 
            variant="patient" 
            onClose={() => setShowNearbyFinder(false)} 
          />
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default PatientDashboard;
