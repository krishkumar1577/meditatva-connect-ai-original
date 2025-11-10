import { memo, useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin, Receipt, PackageSearch, BarChart3, MessageCircle,
  Sparkles, LogOut, Pill, Bell, User, ChevronRight, Activity,
  Zap, TrendingUp, Menu, X, Clock, Eye
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

type Tab = "medicine-requests" | "nearby-stores" | "billing" | "inventory" | "analytics" | "chat" | "ai";

const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const menuItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
  }
};

const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.4)",
      "0 0 40px rgba(59, 130, 246, 0.6)",
      "0 0 20px rgba(59, 130, 246, 0.4)",
    ],
  }
};

export const DashboardLayout = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("medicine-requests");
  const [scrolled, setScrolled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'medicine-request',
      title: 'New Medicine Request',
      message: 'John Doe requested Paracetamol 500mg',
      time: '2 minutes ago',
      unread: true,
      priority: 'high'
    },
    {
      id: 2,
      type: 'medicine-request',
      title: 'Urgent Medicine Request',
      message: 'Sarah Smith needs insulin prescription',
      time: '5 minutes ago',
      unread: true,
      priority: 'urgent'
    },
    {
      id: 3,
      type: 'medicine-request',
      title: 'Medicine Request Updated',
      message: 'Mike Johnson updated prescription details',
      time: '15 minutes ago',
      unread: false,
      priority: 'medium'
    }
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: Array<{
    id: Tab;
    icon: LucideIcon;
    label: string;
    section?: 'main' | 'secondary';
    gradient: string;
  }> = [
    {
      id: "medicine-requests",
      icon: Pill,
      label: "Medicine Requests",
      section: 'main',
      gradient: "from-red-500 to-pink-400"
    },
    {
      id: "nearby-stores",
      icon: MapPin,
      label: "Nearby Medical Stores",
      section: 'main',
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      id: "billing",
      icon: Receipt,
      label: "Billing & Invoices",
      section: 'main',
      gradient: "from-emerald-500 to-teal-400"
    },
    {
      id: "inventory",
      icon: PackageSearch,
      label: "Inventory Management",
      section: 'main',
      gradient: "from-violet-500 to-purple-400"
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics & Reports",
      section: 'secondary',
      gradient: "from-orange-500 to-amber-400"
    },
    {
      id: "chat",
      icon: MessageCircle,
      label: "Patient Chat",
      section: 'secondary',
      gradient: "from-pink-500 to-rose-400"
    },
    {
      id: "ai",
      icon: Sparkles,
      label: "AI Insights",
      section: 'secondary',
      gradient: "from-indigo-500 to-blue-400"
    },
  ];

  useEffect(() => {
    const path = location.pathname.split('/').pop() as Tab;
    if (path && ['medicine-requests', 'nearby-stores', 'billing', 'inventory', 'analytics', 'chat', 'ai'].includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === "/pharmacy/dashboard" || location.pathname === "/pharmacy/dashboard/") {
      navigate("/pharmacy/dashboard/medicine-requests", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Auth check
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "pharmacy") {
      navigate("/login?role=pharmacy");
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex relative z-10">
        {/* Glassmorphism Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } min-h-screen fixed left-0 top-0 transition-all duration-300`}
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '4px 0 24px rgba(59, 130, 246, 0.08), inset -1px 0 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex flex-col h-full p-6">
            {/* Logo Section */}
            <motion.div
              className="mb-8 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="relative h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <Pill className="h-6 w-6 text-white" />
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      MediTatva
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Pharmacy Portal</p>
                  </motion.div>
                )}
              </div>

              {/* Live Status Indicator */}
              {!sidebarCollapsed && (
                <motion.div
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-500"
                    variants={pulseVariants}
                    animate="animate"
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs font-semibold text-emerald-700">Live Dashboard</span>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation Header */}
            {!sidebarCollapsed && (
              <motion.p
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3"
                variants={menuItemVariants}
              >
                Navigation
              </motion.p>
            )}

            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              <AnimatePresence>
                {menuItems.map((item, index) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  const showDivider = !sidebarCollapsed && index === 3; // After Inventory Management

                  return (
                    <div key={item.id}>
                      <NavLink to={`/pharmacy/dashboard/${item.id}`}>
                        <motion.div
                          variants={menuItemVariants}
                          className="relative group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full"
                              style={{
                                background: 'linear-gradient(to bottom, #3B82F6 0%, #60A5FA 100%)',
                              }}
                              variants={glowVariants}
                              animate="animate"
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}

                          <div
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden
                              ${isActive
                                ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                              }
                              ${sidebarCollapsed ? 'justify-center' : ''}
                            `}
                          >
                            {/* Hover Glow Effect */}
                            {!isActive && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                              />
                            )}

                            {/* Icon with Gradient Background */}
                            <motion.div
                              className={`
                                relative h-10 w-10 rounded-xl flex items-center justify-center
                                ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100`}
                              `}
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                              
                              {/* Pulsing Dot for Active State */}
                              {isActive && (
                                <motion.div
                                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white"
                                  variants={pulseVariants}
                                  animate="animate"
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </motion.div>

                            {!sidebarCollapsed && (
                              <motion.div
                                className="flex-1 flex items-center justify-between"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                  {item.label}
                                </p>
                                {/* Notification Badge for Medicine Requests */}
                                {item.id === 'medicine-requests' && unreadCount > 0 && !isActive && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    {unreadCount}
                                  </motion.div>
                                )}
                              </motion.div>
                            )}

                            {!sidebarCollapsed && isActive && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                              >
                                <ChevronRight className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </NavLink>

                      {/* Section Divider */}
                      {showDivider && (
                        <motion.div
                          className="my-4"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                          {!sidebarCollapsed && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">
                              Advanced Tools
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </AnimatePresence>
            </nav>

            {/* Logout Button */}
            <motion.div
              className="mt-auto pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                className={`
                  w-full group relative overflow-hidden
                  bg-white/60 hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500
                  text-rose-600 hover:text-white
                  border-2 border-rose-200 hover:border-rose-500
                  font-semibold transition-all duration-300
                  shadow-md hover:shadow-lg hover:shadow-rose-500/30
                  ${sidebarCollapsed ? 'p-3' : 'py-3'}
                `}
                onClick={handleLogout}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <motion.div
                    className="h-8 w-8 rounded-lg bg-rose-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.div>
                  {!sidebarCollapsed && <span>Logout</span>}
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
          {/* Floating Navbar */}
          <motion.header
            className={`
              sticky top-4 mx-6 mb-6 z-50 rounded-2xl transition-all duration-300
              ${scrolled 
                ? 'bg-white/80 backdrop-blur-xl shadow-xl shadow-blue-500/10' 
                : 'bg-white/60 backdrop-blur-lg shadow-lg'
              }
            `}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Breadcrumb */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hover:bg-blue-500/10 hover:text-blue-600"
                  >
                    {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center gap-2">
                    {menuItems.find(item => item.id === activeTab) && (
                      <>
                        <motion.div
                          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${menuItems.find(item => item.id === activeTab)?.gradient} flex items-center justify-center`}
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          style={{
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)',
                          }}
                        >
                          {(() => {
                            const Icon = menuItems.find(item => item.id === activeTab)?.icon;
                            return Icon ? <Icon className="h-5 w-5 text-white" /> : null;
                          })()}
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {menuItems.find(item => item.id === activeTab)?.label}
                          </p>
                          <p className="text-xs text-slate-500">MediTatva Dashboard</p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Right Actions */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Activity Indicator */}
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Active</span>
                  </motion.div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative h-11 w-11 rounded-xl hover:bg-blue-500/10 hover:text-blue-600"
                      >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <motion.span
                            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {unreadCount}
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-blue-500/20 z-50 max-h-96 overflow-hidden"
                          style={{
                            background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 253, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                          }}
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-blue-500/10">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-blue-600">Notifications</h3>
                              <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                  <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full font-semibold">
                                    {unreadCount} new
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowNotifications(false)}
                                  className="h-6 w-6 p-0 hover:bg-blue-500/10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Notifications List */}
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-6 text-center text-slate-500">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No new notifications</p>
                              </div>
                            ) : (
                              <div className="p-2">
                                {notifications.map((notification) => (
                                  <motion.div
                                    key={notification.id}
                                    whileHover={{ x: 2 }}
                                    onClick={() => {
                                      if (notification.type === 'medicine-request') {
                                        navigate('/pharmacy/dashboard/medicine-requests');
                                        setShowNotifications(false);
                                      }
                                    }}
                                    className={`
                                      p-3 rounded-lg mb-2 cursor-pointer transition-all duration-300
                                      ${notification.unread 
                                        ? 'bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10' 
                                        : 'bg-gray-50/50 hover:bg-gray-100/50'
                                      }
                                    `}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`
                                        h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${notification.priority === 'urgent' 
                                          ? 'bg-red-500 text-white' 
                                          : notification.priority === 'high'
                                          ? 'bg-orange-500 text-white'
                                          : 'bg-blue-500 text-white'
                                        }
                                      `}>
                                        <Pill className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className={`
                                            text-sm font-semibold truncate
                                            ${notification.unread ? 'text-blue-600' : 'text-slate-600'}
                                          `}>
                                            {notification.title}
                                          </h4>
                                          {notification.unread && (
                                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                          {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Clock className="h-3 w-3 text-slate-500" />
                                          <span className="text-xs text-slate-500">
                                            {notification.time}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="p-3 border-t border-blue-500/10 bg-blue-50/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigate('/pharmacy/dashboard/medicine-requests');
                                setShowNotifications(false);
                              }}
                              className="w-full text-blue-600 hover:bg-blue-500/10 hover:text-blue-600 font-semibold"
                            >
                              View All Requests
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile */}
                  <motion.div
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-blue-50 hover:from-blue-500 hover:to-cyan-500 cursor-pointer group transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-white ring-offset-2 ring-offset-blue-100">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=pharmacist" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold">
                        PH
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors">
                        Pharmacist
                      </p>
                      <p className="text-xs text-slate-500 group-hover:text-white/80 transition-colors">
                        Admin
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Page Content */}
          <motion.main
            className="px-6 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
});

DashboardLayout.displayName = "DashboardLayout";
