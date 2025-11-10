import { useState, useEffect, memo } from "react";
import { useNavigate, useLocation, NavLink, Routes, Route, Outlet } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Chatbot } from "@/components/Chatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocationDisplay } from "@/components/LocationDisplay";
import { NearbyPharmacyFinder } from "@/components/NearbyPharmacyFinder";
import { NearbyMedicalStoresPage } from "./NearbyMedicalStoresPage";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import {
  Package, MessageCircle, TrendingUp, Users, LogOut, Search,
  Plus, Edit, Trash2, AlertCircle, Pill, Sparkles, ArrowUp,
  Home, BarChart3, Settings, Receipt, Brain, Bell, Download,
  Calendar, Mail, Phone, User, CreditCard, X, FileText, CheckCircle,
  ShoppingCart, Activity, Zap, TrendingDown, Clock, MapPin
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

// Mock Data
const statsData = {
  totalMedicines: { value: 1245, change: 12 },
  activePatients: { value: 342, change: 8 },
  monthlyRevenue: { value: 48.5, change: 23 },
  chatRequests: { value: 28, new: 3 }
};

const inventoryAlerts = [
  { id: 1, name: "Ibuprofen 400mg", current: 5, threshold: 20, status: "CRITICAL" },
  { id: 2, name: "Amoxicillin 250mg", current: 15, threshold: 50, status: "WARNING" },
  { id: 3, name: "Cetirizine 10mg", current: 8, threshold: 30, status: "CRITICAL" },
  { id: 4, name: "Paracetamol 500mg", current: 25, threshold: 100, status: "WARNING" },
];

const aiInsights = [
  {
    id: 1,
    title: "Flu Season Spike",
    confidence: 94,
    suggestion: "Restock Paracetamol & Cetirizine",
    trend: "up"
  },
  {
    id: 2,
    title: "Allergy Season",
    confidence: 87,
    suggestion: "Restock Cetirizine & Loratadine",
    trend: "up"
  },
  {
    id: 3,
    title: "Antibiotic Demand Drop",
    confidence: 76,
    suggestion: "Reduce Amoxicillin orders",
    trend: "down"
  }
];

// Advanced Patient Chat Data
const chatData = {
  active: [
    {
      id: 1,
      patientName: "Rajesh Kumar",
      lastMessage: "Is Azithromycin 500mg available?",
      time: "2 mins ago",
      urgency: "Prescription Query",
      unread: 2,
      avatar: "RK",
      status: "active"
    },
    {
      id: 2,
      patientName: "Priya Sharma",
      lastMessage: "Can you suggest substitute for Dolo 650?",
      time: "15 mins ago",
      urgency: "Availability Check",
      unread: 1,
      avatar: "PS",
      status: "active"
    },
    {
      id: 3,
      patientName: "Amit Patel",
      lastMessage: "Uploaded prescription for review",
      time: "1 hour ago",
      urgency: "Prescription Upload",
      unread: 3,
      avatar: "AP",
      status: "active"
    }
  ],
  pending: [
    {
      id: 4,
      patientName: "Sneha Gupta",
      lastMessage: "Need price quote for diabetes medicines",
      time: "3 hours ago",
      urgency: "Price Check",
      unread: 0,
      avatar: "SG",
      status: "pending"
    }
  ],
  resolved: [
    {
      id: 5,
      patientName: "Vikram Singh",
      lastMessage: "Thank you for the quick delivery!",
      time: "Yesterday",
      urgency: "Order Confirmed",
      unread: 0,
      avatar: "VS",
      status: "resolved",
      rating: 5
    }
  ]
};

const chatAnalyticsData = {
  queryTypes: [
    { type: "Medicine Availability", count: 145 },
    { type: "Price Check", count: 98 },
    { type: "Prescription Upload", count: 76 },
    { type: "Substitute Suggestion", count: 54 },
    { type: "Dosage Query", count: 32 }
  ],
  chatVolumeTrend: [
    { day: "Mon", chats: 28 },
    { day: "Tue", chats: 34 },
    { day: "Wed", chats: 31 },
    { day: "Thu", chats: 42 },
    { day: "Fri", chats: 38 },
    { day: "Sat", chats: 25 },
    { day: "Sun", chats: 18 }
  ],
  responseTimeDistribution: [
    { range: "< 5 min", count: 145, percentage: 58 },
    { range: "5-15 min", count: 62, percentage: 25 },
    { range: "15-30 min", count: 28, percentage: 11 },
    { range: "> 30 min", count: 15, percentage: 6 }
  ],
  satisfactionMetrics: [
    { metric: "Response Time", score: 4.5, max: 5 },
    { metric: "Clarity", score: 4.7, max: 5 },
    { metric: "Politeness", score: 4.8, max: 5 },
    { metric: "Helpfulness", score: 4.6, max: 5 }
  ]
};

// Advanced AI Insights Data
const aiPredictiveData = {
  demandForecast: [
    { day: "Nov 4", paracetamol: 45, cetirizine: 32, amoxicillin: 28 },
    { day: "Nov 11", paracetamol: 52, cetirizine: 38, amoxicillin: 24 },
    { day: "Nov 18", paracetamol: 68, cetirizine: 45, amoxicillin: 22 },
    { day: "Nov 25", paracetamol: 75, cetirizine: 52, amoxicillin: 20 },
    { day: "Dec 2", paracetamol: 82, cetirizine: 58, amoxicillin: 18 }
  ],
  stockRunoutPrediction: [
    { medicine: "Cetirizine", currentStock: 8, predictedRunout: "Nov 10", confidence: 94 },
    { medicine: "Ibuprofen", currentStock: 5, predictedRunout: "Nov 6", confidence: 98 },
    { medicine: "Paracetamol", currentStock: 25, predictedRunout: "Nov 15", confidence: 87 },
    { medicine: "Azithromycin", currentStock: 12, predictedRunout: "Nov 12", confidence: 91 },
    { medicine: "Omeprazole", currentStock: 18, predictedRunout: "Nov 20", confidence: 83 }
  ],
  regionalHealthTrends: [
    { area: "North Zone", fever: 45, allergy: 32, digestive: 18 },
    { area: "South Zone", fever: 38, allergy: 42, digestive: 22 },
    { area: "East Zone", fever: 52, allergy: 28, digestive: 15 },
    { area: "West Zone", fever: 41, allergy: 35, digestive: 20 }
  ],
  seasonalDiseaseComparison: [
    { month: "Sep", coldFlu: 45, allergy: 72 },
    { month: "Oct", coldFlu: 62, allergy: 58 },
    { month: "Nov", coldFlu: 78, allergy: 38 },
    { month: "Dec", coldFlu: 95, allergy: 25 },
    { month: "Jan", coldFlu: 110, allergy: 20 }
  ],
  revenueCorrelation: [
    { month: "Jun", revenue: 45.5, demand: 320 },
    { month: "Jul", revenue: 48.2, demand: 342 },
    { month: "Aug", revenue: 52.8, demand: 378 },
    { month: "Sep", revenue: 58.4, demand: 405 },
    { month: "Oct", revenue: 61.2, demand: 428 }
  ],
  profitOptimization: [
    {
      id: 1,
      suggestion: "Bundle Cetirizine + Paracetamol",
      expectedLift: "+18%",
      confidence: 89,
      reasoning: "High co-purchase rate during allergy season"
    },
    {
      id: 2,
      suggestion: "Increase Vitamin C pricing by 8%",
      expectedLift: "+12%",
      confidence: 84,
      reasoning: "Low price sensitivity, high seasonal demand"
    },
    {
      id: 3,
      suggestion: "Offer 10% discount on Omeprazole bulk",
      expectedLift: "+22%",
      confidence: 91,
      reasoning: "Encourages larger orders from chronic patients"
    }
  ],
  smartAlerts: [
    {
      id: 1,
      type: "demand",
      severity: "high",
      title: "Demand Surge Detected",
      message: "Fever cases up 45% in your area",
      icon: "trending-up",
      color: "#E74C3C"
    },
    {
      id: 2,
      type: "stock",
      severity: "critical",
      title: "Critical Stock Risk",
      message: "3 medicines predicted to run out within 7 days",
      icon: "alert-circle",
      color: "#F1C40F"
    },
    {
      id: 3,
      type: "revenue",
      severity: "medium",
      title: "Revenue Opportunity",
      message: "Antibiotic demand dropped 23% - consider promotions",
      icon: "trending-down",
      color: "#4FC3F7"
    }
  ],
  aiConfidence: {
    overall: 87,
    demandPrediction: 92,
    stockForecasting: 89,
    pricingOptimization: 81,
    seasonalTrends: 94
  }
};

const topSellingData = [
  { name: "Paracetamol", sales: 450 },
  { name: "Amoxicillin", sales: 320 },
  { name: "Cetirizine", sales: 280 },
  { name: "Ibuprofen", sales: 240 },
  { name: "Omeprazole", sales: 190 }
];

const reservationsData = [
  { day: "Mon", count: 45 },
  { day: "Tue", count: 52 },
  { day: "Wed", count: 48 },
  { day: "Thu", count: 61 },
  { day: "Fri", count: 55 },
  { day: "Sat", count: 38 },
  { day: "Sun", count: 28 }
];

const inventoryTrendsData = [
  { month: "Jan", stock: 1200 },
  { month: "Feb", stock: 1150 },
  { month: "Mar", stock: 1300 },
  { month: "Apr", stock: 1245 }
];

const medicineDatabase = [
  { id: 1, name: "Paracetamol 500mg", price: 5, stock: 450 },
  { id: 2, name: "Ibuprofen 400mg", price: 8, stock: 5 },
  { id: 3, name: "Amoxicillin 250mg", price: 12, stock: 15 },
  { id: 4, name: "Cetirizine 10mg", price: 6, stock: 8 },
  { id: 5, name: "Omeprazole 20mg", price: 10, stock: 190 },
];

const billingHistory = [
  { id: "INV-001", patient: "John Doe", date: "2025-11-01", total: 245, status: "Paid" },
  { id: "INV-002", patient: "Jane Smith", date: "2025-11-02", total: 180, status: "Paid" },
  { id: "INV-003", patient: "Bob Johnson", date: "2025-11-03", total: 420, status: "Pending" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

type Tab = "analytics" | "inventory" | "chat" | "ai" | "billing" | "nearby-stores";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showNearbyFinder, setShowNearbyFinder] = useState(false);
  
  // Billing form state
  const [patientName, setPatientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");

  // Patient Chat State
  const [chatFilter, setChatFilter] = useState<"active" | "pending" | "resolved">("active");
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // AI Insights State
  const [autoReorderMode, setAutoReorderMode] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  useEffect(() => {
    if (location.pathname === "/pharmacy/dashboard" || location.pathname === "/pharmacy/dashboard/") {
      navigate("/pharmacy/dashboard/analytics", { replace: true });
    }
  }, [location.pathname, navigate]);

  const currentTab: Tab = (() => {
    const segment = location.pathname.replace(/\/$/, "").split("/").pop() as Tab | undefined;
    return segment && ["analytics", "inventory", "chat", "ai", "billing", "nearby-stores"].includes(segment)
      ? segment
      : "analytics";
  })();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "pharmacy") {
      navigate("/login?role=pharmacy");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const addToCart = (medicine: typeof medicineDatabase[0]) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.quantity < medicine.stock) {
        setCart(cart.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error("Cannot exceed available stock");
      }
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    const item = cart.find(i => i.id === id);
    if (item && quantity <= item.stock && quantity > 0) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% GST
  };

  const calculatePlatformFee = () => {
    return calculateSubtotal() * 0.02; // 2% Platform Fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculatePlatformFee();
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setShowBillingModal(true);
  };

  const handleSaveAndExportPDF = () => {
    if (!patientName || !contactNumber) {
      toast.error("Please fill required fields");
      return;
    }
    
    try {
      // Generate PDF
      const doc = new jsPDF();
      const invoiceNumber = `INV${String(billingHistory.length + 1).padStart(4, '0')}`;
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Header - MediTatva Branding
      doc.setFillColor(27, 108, 168); // #1B6CA8
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("MediTatva", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Professional Healthcare Solutions", 105, 28, { align: 'center' });
      
      // Invoice Details
      doc.setTextColor(10, 35, 66); // #0A2342
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 20, 55);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice #: ${invoiceNumber}`, 20, 65);
      doc.text(`Date: ${currentDate}`, 20, 72);
      
      // Patient Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 20, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(patientName, 20, 92);
      doc.text(`Phone: ${contactNumber}`, 20, 99);
      if (email) {
        doc.text(`Email: ${email}`, 20, 106);
      }
      doc.text(`Payment: ${paymentType}`, 20, email ? 113 : 106);
      
      // Table Header
      const tableTop = email ? 125 : 118;
      doc.setFillColor(232, 244, 248); // Light blue background
      doc.rect(20, tableTop, 170, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Medicine", 25, tableTop + 7);
      doc.text("Qty", 120, tableTop + 7);
      doc.text("Price", 145, tableTop + 7);
      doc.text("Total", 170, tableTop + 7);
      
      // Table Content
      let yPosition = tableTop + 15;
      doc.setFont("helvetica", "normal");
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        doc.text(item.name, 25, yPosition);
        doc.text(String(item.quantity), 125, yPosition);
        doc.text(`₹${item.price.toFixed(2)}`, 145, yPosition);
        doc.text(`₹${itemTotal.toFixed(2)}`, 170, yPosition);
        yPosition += 7;
        
        // Add new page if needed
        if (yPosition > 250 && index < cart.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Totals Section
      yPosition += 5;
      doc.setDrawColor(27, 108, 168);
      doc.line(20, yPosition, 190, yPosition); // Line separator
      yPosition += 10;
      
      const subtotal = calculateSubtotal();
      const gst = calculateTax();
      const platformFee = calculatePlatformFee();
      const finalTotal = calculateTotal();
      
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", 120, yPosition);
      doc.text(`₹${subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 7;
      
      doc.text("GST (5%):", 120, yPosition);
      doc.text(`₹${gst.toFixed(2)}`, 170, yPosition);
      yPosition += 7;
      
      doc.text("Platform Fee (2%):", 120, yPosition);
      doc.text(`₹${platformFee.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
      
      // Final Total with highlight
      doc.setFillColor(27, 108, 168);
      doc.rect(115, yPosition - 5, 75, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Final Total:", 120, yPosition + 2);
      doc.text(`₹${finalTotal.toFixed(2)}`, 170, yPosition + 2);
      
      // Footer
      doc.setTextColor(90, 106, 133); // #5A6A85
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for choosing MediTatva. For queries, contact: support@meditatva.com", 105, 280, { align: 'center' });
      
      // Save PDF
      doc.save(`Invoice_${invoiceNumber}_${currentDate.replace(/ /g, '_')}.pdf`);
      
      toast.success("Invoice exported successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
      return;
    }
    
    // Reset form
    setShowBillingModal(false);
    setCart([]);
    setPatientName("");
    setContactNumber("");
    setEmail("");
    setPaymentType("Cash");
  };

  const filteredMedicines = medicineDatabase.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems: Array<{ id: Tab; icon: LucideIcon; label: string }> = [
    { id: "analytics", icon: BarChart3, label: "Analytics & Reports" },
    { id: "inventory", icon: Package, label: "Inventory Management" },
    { id: "chat", icon: MessageCircle, label: "Patient Chat" },
    { id: "ai", icon: Brain, label: "AI Insights" },
    { id: "billing", icon: Receipt, label: "Billing & Invoices" },
    { id: "nearby-stores", icon: MapPin, label: "Nearby Medical Stores" },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Professional Healthcare Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F8] via-[#F7F9FC] to-[#FFFFFF]" />
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4FC3F7]/60 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1B6CA8]/40 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        className="w-64 relative z-10 flex-shrink-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="fixed top-0 left-0 h-full w-64 p-6 border-r"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(27, 108, 168, 0.1)',
            boxShadow: '2px 0 20px rgba(27, 108, 168, 0.05)',
          }}
        >
          {/* Logo with Medical Blue */}
          <motion.div
            className="flex items-center gap-3 mb-10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center shadow-xl shadow-[#1B6CA8]/40">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0A2342]">MediTatva</h1>
              <p className="text-xs text-[#1B6CA8] font-medium">Pharmacy Portal</p>
            </div>
          </motion.div>

          {/* Menu Items */}
          <LayoutGroup>
            <nav className="space-y-2 mb-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/pharmacy/dashboard/${item.id}`}
                  className="block"
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? "bg-white/80 border-[#4FC3F7]/40 shadow-lg shadow-[#4FC3F7]/20"
                          : "border-transparent hover:bg-white/60"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-glow"
                          className="absolute left-0 top-1/2 h-10 w-1 rounded-r-full bg-gradient-to-b from-[#4FC3F7] to-[#1B6CA8] shadow-[0_0_12px_rgba(79,195,247,0.7)]"
                          style={{ translateY: "-50%" }}
                        />
                      )}
                      <item.icon
                        className={`h-5 w-5 transition-colors ${
                          isActive ? "text-[#1B6CA8]" : "text-[#5A6A85]"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isActive ? "text-[#0A2342]" : "text-[#5A6A85]"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-dot"
                          className="ml-auto h-2 w-2 rounded-full bg-[#4FC3F7] shadow-[0_0_10px_rgba(79,195,247,0.8)]"
                        />
                      )}
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </nav>
          </LayoutGroup>

          {/* Logout Button */}
          <motion.div
            className="absolute bottom-6 left-6 right-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-[#E74C3C]/30 hover:bg-[#E74C3C]/10 text-[#E74C3C] font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto bg-gradient-to-br from-[#E8F4F8]/50 via-[#F7F9FC]/30 to-[#FFFFFF]/10">
        {/* Top Bar */}
        <div
          className="sticky top-0 z-20 border-b"
          style={{
            background: 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
          }}
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {menuItems.find(m => m.id === currentTab)?.label}
              </h2>
              <p className="text-sm text-white/80">Welcome back, HealthPlus Pharmacy</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowNearbyFinder(true)}
                  className="gap-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden md:inline">Find Nearby Stores</span>
                </Button>
              </motion.div>
              <LocationDisplay variant="pharmacy" showFullAddress={false} />
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-white/10 text-white"
                >
                  <Bell className="h-5 w-5" />
                  <motion.span
                    className="absolute top-1 right-1 h-2 w-2 bg-[#4FC3F7] rounded-full shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 md:p-4 lg:p-5 max-w-[1800px] mx-auto min-h-screen">
          <AnimatePresence mode="wait">
            {currentTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card
                      className="p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]" />
                      <div className="flex items-center justify-between mb-3">
                        <Package className="h-8 w-8 text-[#1B6CA8]" />
                        <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {statsData.totalMedicines.change}%
                        </Badge>
                      </div>
                      <motion.p
                        className="text-3xl font-bold text-[#0A2342] mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {statsData.totalMedicines.value.toLocaleString()}
                      </motion.p>
                      <p className="text-sm text-[#5A6A85] font-medium">Total Medicines</p>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card
                      className="p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4FC3F7] to-[#1B6CA8]" />
                      <div className="flex items-center justify-between mb-3">
                        <Users className="h-8 w-8 text-[#4FC3F7]" />
                        <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {statsData.activePatients.change}%
                        </Badge>
                      </div>
                      <motion.p
                        className="text-3xl font-bold text-[#0A2342] mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {statsData.activePatients.value}
                      </motion.p>
                      <p className="text-sm text-[#5A6A85] font-medium">Active Patients</p>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card
                      className="p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]" />
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="h-8 w-8 text-[#2ECC71]" />
                        <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {statsData.monthlyRevenue.change}%
                        </Badge>
                      </div>
                      <motion.p
                        className="text-3xl font-bold text-[#0A2342] mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        ₹{statsData.monthlyRevenue.value}K
                      </motion.p>
                      <p className="text-sm text-[#5A6A85] font-medium">Monthly Revenue</p>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card
                      className="p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]" />
                      <div className="flex items-center justify-between mb-3">
                        <MessageCircle className="h-8 w-8 text-[#4FC3F7]" />
                        <Badge className="bg-[#4FC3F7]/10 text-[#1B6CA8] border-[#4FC3F7]/30 font-semibold">
                          {statsData.chatRequests.new} New
                        </Badge>
                      </div>
                      <motion.p
                        className="text-3xl font-bold text-[#0A2342] mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {statsData.chatRequests.value}
                      </motion.p>
                      <p className="text-sm text-[#5A6A85] font-medium">Chat Requests</p>
                    </Card>
                  </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Top Selling Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3">Top Selling Medicines</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topSellingData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="name" stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              color: '#0A2342',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                            {topSellingData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? '#1B6CA8' : `hsl(${195 + index * 10}, ${70 - index * 10}%, ${50 + index * 5}%)`}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>

                  {/* Monthly Revenue Trend */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3">Inventory Trends</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={inventoryTrendsData}>
                          <defs>
                            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.6} />
                              <stop offset="95%" stopColor="#1B6CA8" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="month" stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              color: '#0A2342',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="stock"
                            stroke="#1B6CA8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorStock)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Daily Reservations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3">Daily Reservations</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={reservationsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="day" stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              color: '#0A2342',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#4FC3F7"
                            strokeWidth={3}
                            dot={{ fill: '#1B6CA8', r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Inventory Management Tab */}
            {currentTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Inventory Alerts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0A2342] flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[#E74C3C]" />
                        Inventory Threshold Alerts
                      </h3>
                      <Badge className="bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30 font-semibold">
                        {inventoryAlerts.filter(a => a.status === "CRITICAL").length} Critical
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {inventoryAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className={`p-4 rounded-xl border ${
                            alert.status === "CRITICAL"
                              ? "bg-[#E74C3C]/5 border-[#E74C3C]/30"
                              : "bg-[#F1C40F]/5 border-[#F1C40F]/30"
                          }`}
                        >
                          {alert.status === "CRITICAL" && (
                            <motion.div
                              className="absolute -top-1 -left-1 w-3 h-3 bg-[#E74C3C] rounded-full"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Badge
                                className={`mb-2 ${
                                  alert.status === "CRITICAL"
                                    ? "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/40 font-bold"
                                    : "bg-[#F1C40F]/10 text-[#F39C12] border-[#F1C40F]/40 font-bold"
                                }`}
                              >
                                {alert.status}
                              </Badge>
                              <h4 className="font-semibold text-[#0A2342] mb-1">{alert.name}</h4>
                              <p className="text-sm text-[#5A6A85]">
                                Stock: {alert.current} / {alert.threshold}
                              </p>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    alert.status === "CRITICAL" ? "bg-[#E74C3C]" : "bg-[#F1C40F]"
                                  }`}
                                  style={{ width: `${(alert.current / alert.threshold) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold shadow-md"
                            >
                              Reorder Now
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Stock Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#1B6CA8]" />
                      All Medicines Inventory
                    </h3>
                    <div className="space-y-3">
                      {medicineDatabase.map((med, index) => (
                        <motion.div
                          key={med.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-[#F7F9FC] border border-[#4FC3F7]/20 hover:border-[#1B6CA8]/40 transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-[#0A2342]">{med.name}</p>
                            <p className="text-sm text-[#5A6A85]">₹{med.price} per unit</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-bold ${
                                med.stock < 20 ? 'text-[#E74C3C]' : 
                                med.stock < 50 ? 'text-[#F1C40F]' : 
                                'text-[#2ECC71]'
                              }`}>
                                {med.stock} units
                              </p>
                              <p className="text-xs text-[#5A6A85]">In Stock</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-[#1B6CA8]/30">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Patient Chat Tab */}
            {currentTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Smart Chat Inbox Header */}
                <Card
                  className="p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(27, 108, 168, 0.05) 0%, rgba(79, 195, 247, 0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.15)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#0A2342] flex items-center gap-2">
                      <MessageCircle className="h-6 w-6 text-[#4FC3F7]" />
                      Patient Communication Hub
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#4FC3F7]/10 text-[#1B6CA8] border-[#4FC3F7]/30 font-semibold px-3 py-1">
                        <Activity className="h-3 w-3 mr-1" />
                        {chatData.active.length + chatData.pending.length} Active
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                        className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </div>
                  </div>

                  {/* Chat Filter Tabs */}
                  <div className="flex gap-2 mb-4">
                    {(["active", "pending", "resolved"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={chatFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatFilter(filter)}
                        className={chatFilter === filter
                          ? "bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white"
                          : "border-[#1B6CA8]/30 text-[#0A2342] hover:bg-[#E8F4F8]"
                        }
                      >
                        {filter === "active" && "💬 Active"}
                        {filter === "pending" && "⏳ Pending"}
                        {filter === "resolved" && "✅ Resolved"}
                        <Badge className="ml-2 bg-white/20">
                          {filter === "active" && chatData.active.length}
                          {filter === "pending" && chatData.pending.length}
                          {filter === "resolved" && chatData.resolved.length}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3">
                    {chatData[chatFilter].map((chat, index) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-white border border-[#4FC3F7]/20 hover:border-[#1B6CA8]/40 hover:shadow-lg transition-all cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {chat.avatar}
                              </div>
                              {chat.unread > 0 && (
                                <motion.div
                                  className="absolute -top-1 -right-1 h-5 w-5 bg-[#E74C3C] rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  {chat.unread}
                                </motion.div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#0A2342] text-lg">{chat.patientName}</p>
                              <p className="text-xs text-[#5A6A85] flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {chat.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={
                              chat.urgency.includes("Prescription") ? "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30 font-semibold" :
                              chat.urgency.includes("Availability") ? "bg-[#F1C40F]/10 text-[#F39C12] border-[#F1C40F]/30 font-semibold" :
                              "bg-[#4FC3F7]/10 text-[#1B6CA8] border-[#4FC3F7]/30 font-semibold"
                            }>
                              {chat.urgency}
                            </Badge>
                            {chat.rating && (
                              <div className="flex items-center gap-1 text-[#F1C40F]">
                                {Array.from({ length: chat.rating }).map((_, i) => (
                                  <Sparkles key={i} className="h-3 w-3 fill-current" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#5A6A85] mb-4 pl-15">{chat.lastMessage}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white font-semibold">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#2ECC71]/30 text-[#2ECC71] hover:bg-[#2ECC71]/10">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Resolved
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Create Order
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#F1C40F]/30 text-[#F39C12] hover:bg-[#F1C40F]/10">
                            <FileText className="h-3 w-3 mr-1" />
                            Generate Quote
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Chat Analytics Section */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Query Types Bar Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#4FC3F7]" />
                        Most Frequent Query Types
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chatAnalyticsData.queryTypes} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis type="number" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <YAxis dataKey="type" type="category" width={140} stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                            {chatAnalyticsData.queryTypes.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`hsl(${195 + index * 15}, ${70 - index * 8}%, ${50 + index * 3}%)`}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>

                  {/* Chat Volume Trend */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#2ECC71]" />
                        Chat Volume Trend (Last 7 Days)
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chatAnalyticsData.chatVolumeTrend}>
                          <defs>
                            <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1B6CA8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="day" stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 12, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="chats"
                            stroke="#1B6CA8"
                            strokeWidth={3}
                            dot={{ fill: '#4FC3F7', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7 }}
                            fill="url(#chatGradient)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </div>

                {/* Response Time Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#F1C40F]" />
                      Response Time Performance
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {chatAnalyticsData.responseTimeDistribution.map((item, index) => (
                        <motion.div
                          key={item.range}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-[#E8F4F8] to-[#F7F9FC] border border-[#4FC3F7]/20"
                        >
                          <p className="text-3xl font-bold text-[#1B6CA8] mb-1">{item.count}</p>
                          <p className="text-sm font-semibold text-[#0A2342] mb-1">{item.range}</p>
                          <Badge className="bg-[#4FC3F7]/10 text-[#1B6CA8] border-[#4FC3F7]/30">
                            {item.percentage}%
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Patient Satisfaction Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#F1C40F]" />
                      Customer Satisfaction Metrics
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6">
                      {chatAnalyticsData.satisfactionMetrics.map((metric, index) => (
                        <motion.div
                          key={metric.metric}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="text-center"
                        >
                          <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg className="transform -rotate-90 w-24 h-24">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="#E8F4F8"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="url(#gradient-${index})"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(metric.score / metric.max) * 251.2} 251.2`}
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#1B6CA8" />
                                  <stop offset="100%" stopColor="#4FC3F7" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-[#1B6CA8]">{metric.score}</span>
                            </div>
                          </div>
                          <p className="font-semibold text-[#0A2342]">{metric.metric}</p>
                          <p className="text-xs text-[#5A6A85]">out of {metric.max}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* AI Insights Tab */}
            {currentTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* AI Intelligence Hub Header */}
                <Card
                  className="p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(27, 108, 168, 0.1) 0%, rgba(79, 195, 247, 0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.12)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#0A2342] flex items-center gap-2">
                      <Brain className="h-6 w-6 text-[#1B6CA8]" />
                      AI Predictive Intelligence Hub
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#1B6CA8]/10 text-[#1B6CA8] border-[#1B6CA8]/30 font-semibold px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Confidence: {aiPredictiveData.aiConfidence.overall}%
                      </Badge>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-[#4FC3F7]/30">
                        <span className="text-sm font-semibold text-[#0A2342]">Auto-Reorder</span>
                        <button
                          onClick={() => setAutoReorderMode(!autoReorderMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            autoReorderMode ? 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              autoReorderMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Confidence Gauges */}
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(aiPredictiveData.aiConfidence).filter(([key]) => key !== 'overall').map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-3 rounded-xl bg-white border border-[#4FC3F7]/20"
                      >
                        <div className="relative w-16 h-16 mx-auto mb-2">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle cx="32" cy="32" r="28" stroke="#E8F4F8" strokeWidth="6" fill="none" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke={value >= 90 ? "#2ECC71" : value >= 80 ? "#4FC3F7" : "#F1C40F"}
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${(value / 100) * 176} 176`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-[#1B6CA8]">{value}%</span>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-[#0A2342] capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Smart Alerts Panel */}
                <div className="grid md:grid-cols-3 gap-4">
                  {aiPredictiveData.smartAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedAlert(alert.id)}
                    >
                      <Card
                        className="p-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${alert.color}30`,
                          boxShadow: `0 4px 20px ${alert.color}15`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${alert.color}15` }}
                          >
                            {alert.icon === "trending-up" && <TrendingUp className="h-5 w-5" style={{ color: alert.color }} />}
                            {alert.icon === "alert-circle" && <AlertCircle className="h-5 w-5" style={{ color: alert.color }} />}
                            {alert.icon === "trending-down" && <TrendingDown className="h-5 w-5" style={{ color: alert.color }} />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#0A2342] text-sm mb-1">{alert.title}</h4>
                            <p className="text-xs text-[#5A6A85]">{alert.message}</p>
                          </div>
                          <Badge
                            className="text-xs font-bold"
                            style={{
                              backgroundColor: `${alert.color}15`,
                              color: alert.color,
                              borderColor: `${alert.color}40`
                            }}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Demand Forecast Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#2ECC71]" />
                      Predicted Demand Forecast (Next 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={aiPredictiveData.demandForecast}>
                        <defs>
                          <linearGradient id="colorParacetamol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B6CA8" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#1B6CA8" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorCetirizine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorAmoxicillin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F1C40F" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#F1C40F" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                        <XAxis dataKey="day" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                        <YAxis stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            border: '1px solid rgba(27, 108, 168, 0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="paracetamol"
                          stroke="#1B6CA8"
                          strokeWidth={2}
                          fill="url(#colorParacetamol)"
                          name="Paracetamol"
                        />
                        <Area
                          type="monotone"
                          dataKey="cetirizine"
                          stroke="#4FC3F7"
                          strokeWidth={2}
                          fill="url(#colorCetirizine)"
                          name="Cetirizine"
                        />
                        <Area
                          type="monotone"
                          dataKey="amoxicillin"
                          stroke="#F1C40F"
                          strokeWidth={2}
                          fill="url(#colorAmoxicillin)"
                          name="Amoxicillin"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Stock Runout Predictions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-[#E74C3C]" />
                      Top 5 Medicines Predicted to Run Out Soon
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={aiPredictiveData.stockRunoutPrediction} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                        <XAxis type="number" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                        <YAxis dataKey="medicine" type="category" width={100} stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            border: '1px solid rgba(27, 108, 168, 0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-[#4FC3F7]/20">
                                  <p className="font-bold text-[#0A2342]">{data.medicine}</p>
                                  <p className="text-sm text-[#5A6A85]">Current Stock: {data.currentStock}</p>
                                  <p className="text-sm text-[#E74C3C] font-semibold">Predicted Runout: {data.predictedRunout}</p>
                                  <p className="text-sm text-[#1B6CA8]">Confidence: {data.confidence}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="currentStock" radius={[0, 8, 8, 0]}>
                          {aiPredictiveData.stockRunoutPrediction.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.currentStock < 10 ? '#E74C3C' : entry.currentStock < 20 ? '#F1C40F' : '#4FC3F7'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Regional Health Trends & Seasonal Disease Comparison */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Regional Health Trends */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#4FC3F7]" />
                        Regional Health Trend Monitor
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={aiPredictiveData.regionalHealthTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="area" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="fever" fill="#E74C3C" name="Fever Cases" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="allergy" fill="#F1C40F" name="Allergy Cases" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="digestive" fill="#4FC3F7" name="Digestive Issues" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>

                  {/* Seasonal Disease Comparison */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card
                      className="p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(27, 108, 168, 0.15)',
                        boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#F1C40F]" />
                        Seasonal Disease Trend Visualization
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={aiPredictiveData.seasonalDiseaseComparison}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                          <XAxis dataKey="month" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <YAxis stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(27, 108, 168, 0.2)',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="coldFlu"
                            stroke="#1B6CA8"
                            strokeWidth={3}
                            dot={{ fill: '#1B6CA8', strokeWidth: 2, r: 5 }}
                            name="Cold & Flu"
                          />
                          <Line
                            type="monotone"
                            dataKey="allergy"
                            stroke="#F1C40F"
                            strokeWidth={3}
                            dot={{ fill: '#F1C40F', strokeWidth: 2, r: 5 }}
                            name="Allergy"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </div>

                {/* Revenue & Demand Correlation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#2ECC71]" />
                      Revenue & Demand Correlation Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={aiPredictiveData.revenueCorrelation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 108, 168, 0.1)" />
                        <XAxis dataKey="month" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                        <YAxis yAxisId="left" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} label={{ value: 'Revenue (₹K)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#0A2342" tick={{ fontSize: 11, fill: '#5A6A85' }} label={{ value: 'Demand Units', angle: 90, position: 'insideRight' }} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            border: '1px solid rgba(27, 108, 168, 0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.15)',
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2ECC71"
                          strokeWidth={3}
                          dot={{ fill: '#2ECC71', strokeWidth: 2, r: 6 }}
                          name="Monthly Revenue (₹K)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="demand"
                          stroke="#4FC3F7"
                          strokeWidth={3}
                          dot={{ fill: '#4FC3F7', strokeWidth: 2, r: 6 }}
                          name="Predicted Demand"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Profit Optimization Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card
                    className="p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(27, 108, 168, 0.15)',
                      boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#F1C40F]" />
                      AI Profit Optimization Recommendations
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {aiPredictiveData.profitOptimization.map((rec, index) => (
                        <motion.div
                          key={rec.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          className="p-4 rounded-xl bg-gradient-to-br from-[#E8F4F8] to-white border border-[#4FC3F7]/30 hover:border-[#1B6CA8]/50 hover:shadow-lg transition-all"
                          whileHover={{ scale: 1.03 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-bold">
                              {rec.expectedLift}
                            </Badge>
                            <Badge className="bg-[#4FC3F7]/10 text-[#1B6CA8] border-[#4FC3F7]/30 font-semibold">
                              {rec.confidence}% AI
                            </Badge>
                          </div>
                          <h4 className="font-bold text-[#0A2342] mb-2">{rec.suggestion}</h4>
                          <p className="text-xs text-[#5A6A85] mb-3">{rec.reasoning}</p>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white font-semibold"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Apply Strategy
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {currentTab === "billing" && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Search and Add to Cart */}
                <Card
                  className="p-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.15)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                  }}
                >
                  <h3 className="text-lg font-bold text-[#0A2342] mb-3">Search Medicines</h3>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#5A6A85]" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by medicine name..."
                        className="pl-10 bg-white border-[#4FC3F7]/30 text-[#0A2342] placeholder:text-[#5A6A85] focus:border-[#1B6CA8] focus:ring-[#1B6CA8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredMedicines.map((med) => (
                      <motion.div
                        key={med.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#4FC3F7]/20"
                        whileHover={{ scale: 1.01, backgroundColor: '#E8F4F8' }}
                      >
                        <div>
                          <p className="font-semibold text-[#0A2342]">{med.name}</p>
                          <p className="text-sm text-[#5A6A85]">₹{med.price} • Stock: {med.stock}</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => addToCart(med)}
                            disabled={med.stock === 0}
                            className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Cart and Invoice */}
                <Card
                  className="p-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.15)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                  }}
                >
                  <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#1B6CA8]" />
                    Invoice Items
                  </h3>
                  
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-[#5A6A85] mx-auto mb-3" />
                      <p className="text-[#5A6A85]">Cart is empty. Add medicines to create invoice.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#4FC3F7]/20"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-[#0A2342]">{item.name}</p>
                              <p className="text-sm text-[#5A6A85]">₹{item.price} × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-[#4FC3F7]/30 hover:bg-[#E8F4F8]"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="text-[#0A2342] w-8 text-center font-semibold">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-[#4FC3F7]/30 hover:bg-[#E8F4F8]"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <p className="text-[#012A4A] font-bold w-20 text-right">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#E74C3C] hover:text-[#C0392B] hover:bg-[#E74C3C]/10"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="border-t border-[#4FC3F7]/20 pt-4 space-y-2 mb-6">
                        <div className="flex justify-between text-[#5A6A85]">
                          <span>Subtotal:</span>
                          <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#5A6A85]">
                          <span>GST (5%):</span>
                          <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#5A6A85]">
                          <span>Platform Fee (2%):</span>
                          <span className="font-medium">₹{calculatePlatformFee().toFixed(2)}</span>
                        </div>
                        <div className="border-t border-[#4FC3F7]/30 pt-2 mt-2"></div>
                        <div className="flex justify-between text-xl font-bold text-[#0A2342]">
                          <span>Final Total:</span>
                          <span className="text-[#1B6CA8]">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleGenerateInvoice}
                          className="w-full bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold text-lg py-6 shadow-lg"
                        >
                          <FileText className="h-5 w-5 mr-2" />
                          Generate Invoice
                        </Button>
                      </motion.div>
                    </>
                  )}
                </Card>

                {/* Billing History */}
                <Card
                  className="p-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.15)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                  }}
                >
                  <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-[#0077B6]" />
                    Billing History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#4FC3F7]/20">
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Invoice ID</th>
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Patient</th>
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Date</th>
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Total</th>
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Status</th>
                          <th className="text-left py-2 text-[#0A2342] font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((invoice) => (
                          <motion.tr
                            key={invoice.id}
                            className="border-b border-[#4FC3F7]/10 hover:bg-[#E8F4F8]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td className="py-3 text-[#0A2342] font-medium">{invoice.id}</td>
                            <td className="py-3 text-[#0A2342]">{invoice.patient}</td>
                            <td className="py-3 text-[#5A6A85]">{invoice.date}</td>
                            <td className="py-3 text-[#0A2342] font-semibold">₹{invoice.total}</td>
                            <td className="py-3">
                              <Badge
                                className={
                                  invoice.status === "Paid"
                                    ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold"
                                    : "bg-[#F1C40F]/10 text-[#F39C12] border-[#F1C40F]/30 font-semibold"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="ghost" className="text-[#1B6CA8] hover:text-[#4FC3F7] hover:bg-[#E8F4F8]">
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Nearby Medical Stores Tab */}
            {currentTab === "nearby-stores" && (
              <motion.div
                key="nearby-stores"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NearbyMedicalStoresPage />
              </motion.div>
            )}

            {/* Other tabs placeholder */}
            {!["analytics", "billing", "nearby-stores"].includes(currentTab) && (
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="p-12 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(27, 108, 168, 0.15)',
                    boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
                  }}
                >
                  <Activity className="h-16 w-16 text-[#4FC3F7] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-[#0A2342] mb-2">
                    {menuItems.find(m => m.id === currentTab)?.label}
                  </h3>
                  <p className="text-[#5A6A85]">This section is coming soon...</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Patient Billing Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBillingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card
                className="overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 119, 182, 0.2)',
                }}
              >
                <div
                  className="p-6 border-b relative"
                  style={{
                    background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Receipt className="h-6 w-6" />
                      Patient Billing Information
                    </h3>
                    <motion.button
                      onClick={() => setShowBillingModal(false)}
                      className="text-white/90 hover:text-white"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Patient Information */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#012A4A] mb-2 flex items-center gap-2 font-semibold">
                        <User className="h-4 w-4 text-[#0077B6]" />
                        Patient Name *
                      </Label>
                      <Input
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Enter patient name"
                        className="bg-white border-gray-300 text-[#012A4A] placeholder:text-gray-400 focus:border-[#0077B6] focus:ring-[#0077B6]"
                      />
                    </div>

                    <div>
                      <Label className="text-[#012A4A] mb-2 flex items-center gap-2 font-semibold">
                        <Phone className="h-4 w-4 text-[#0077B6]" />
                        Contact Number *
                      </Label>
                      <Input
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="Enter contact number"
                        className="bg-white border-gray-300 text-[#012A4A] placeholder:text-gray-400 focus:border-[#0077B6] focus:ring-[#0077B6]"
                      />
                    </div>

                    <div>
                      <Label className="text-[#012A4A] mb-2 flex items-center gap-2 font-semibold">
                        <Mail className="h-4 w-4 text-[#0077B6]" />
                        Email (Optional)
                      </Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="bg-white border-gray-300 text-[#012A4A] placeholder:text-gray-400 focus:border-[#0077B6] focus:ring-[#0077B6]"
                      />
                    </div>

                    <div>
                      <Label className="text-[#012A4A] mb-2 flex items-center gap-2 font-semibold">
                        <CreditCard className="h-4 w-4 text-[#0077B6]" />
                        Payment Type
                      </Label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-[#012A4A] focus:border-[#0077B6] focus:ring-[#0077B6]"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#012A4A] mb-2 flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-[#0077B6]" />
                        Date
                      </Label>
                      <Input
                        value={new Date().toISOString().split('T')[0]}
                        disabled
                        className="bg-gray-50 border-gray-300 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Medicine Preview */}
                  <div>
                    <Label className="text-[#012A4A] mb-3 flex items-center gap-2 font-semibold">
                      <Pill className="h-4 w-4 text-[#0077B6]" />
                      Medicine List
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-[#F7F9FC] rounded-lg p-3 border border-[#00B4D8]/20">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} × {item.quantity}</span>
                          <span className="text-[#012A4A] font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Summary */}
                  <div className="bg-gradient-to-br from-[#E8F4F8] to-[#F7F9FC] rounded-lg p-5 border border-[#4FC3F7]/30">
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm text-[#5A6A85]">
                        <span>Subtotal:</span>
                        <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#5A6A85]">
                        <span>GST (5%):</span>
                        <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#5A6A85]">
                        <span>Platform Fee (2%):</span>
                        <span className="font-medium">₹{calculatePlatformFee().toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t border-[#4FC3F7]/40 pt-3 flex justify-between items-center">
                      <span className="text-lg text-[#0A2342] font-bold">Final Total:</span>
                      <span className="text-3xl font-bold text-[#1B6CA8]">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSaveAndExportPDF}
                        className="w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#00B4D8] hover:to-[#90E0EF] py-6 text-lg text-white font-semibold shadow-md"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Save & Export PDF
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setShowBillingModal(false)}
                        variant="outline"
                        className="px-8 py-6 border-gray-300 hover:bg-[#F7F9FC] text-[#012A4A] font-medium"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Pharmacy Finder Modal */}
      <AnimatePresence>
        {showNearbyFinder && (
          <NearbyPharmacyFinder 
            variant="pharmacy" 
            onClose={() => setShowNearbyFinder(false)} 
          />
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};
export default PharmacyDashboard;
