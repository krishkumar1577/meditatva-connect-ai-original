import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import {
  Package, Users, TrendingUp, MessageCircle, ArrowUp, Pill,
  AlertCircle, Sparkles
} from "lucide-react";

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

const salesData = [
  { month: "Jan", revenue: 45000, orders: 320 },
  { month: "Feb", revenue: 52000, orders: 380 },
  { month: "Mar", revenue: 48000, orders: 340 },
  { month: "Apr", revenue: 61000, orders: 420 },
  { month: "May", revenue: 55000, orders: 390 },
  { month: "Jun", revenue: 67000, orders: 460 },
];

const topMedicines = [
  { name: "Paracetamol", sales: 1240, revenue: 15500 },
  { name: "Azithromycin", sales: 890, revenue: 24800 },
  { name: "Cetirizine", sales: 750, revenue: 9200 },
  { name: "Amoxicillin", sales: 680, revenue: 18400 },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
};

export const AnalyticsTab = memo(() => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer border-[#4FC3F7]/20 hover:border-[#4FC3F7]/40 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#4FC3F7]/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center shadow-lg shadow-[#1B6CA8]/40">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.totalMedicines.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-1">{statsData.totalMedicines.value}</h3>
              <p className="text-sm text-[#5A6A85] font-medium">Total Medicines</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer border-[#4FC3F7]/20 hover:border-[#4FC3F7]/40 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#2ECC71]/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center shadow-lg shadow-[#2ECC71]/40">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.activePatients.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-1">{statsData.activePatients.value}</h3>
              <p className="text-sm text-[#5A6A85] font-medium">Active Patients</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer border-[#4FC3F7]/20 hover:border-[#4FC3F7]/40 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#F39C12]/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center shadow-lg shadow-[#F39C12]/40">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.monthlyRevenue.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-1">₹{statsData.monthlyRevenue.value}K</h3>
              <p className="text-sm text-[#5A6A85] font-medium">Monthly Revenue</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer border-[#4FC3F7]/20 hover:border-[#4FC3F7]/40 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#4FC3F7]/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4FC3F7] to-[#1B6CA8] flex items-center justify-center shadow-lg shadow-[#4FC3F7]/40">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                {statsData.chatRequests.new > 0 && (
                  <Badge className="bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30 font-semibold">
                    {statsData.chatRequests.new} New
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-1">{statsData.chatRequests.value}</h3>
              <p className="text-sm text-[#5A6A85] font-medium">Chat Requests</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={cardVariants}>
          <Card
            className="p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(27, 108, 168, 0.15)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1B6CA8]" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B6CA8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#5A6A85" />
                <YAxis stroke="#5A6A85" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1B6CA8"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(27, 108, 168, 0.15)',
              boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
            }}
          >
            <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#1B6CA8]" />
              Top Selling Medicines
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topMedicines}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#5A6A85" />
                <YAxis stroke="#5A6A85" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                  {topMedicines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1B6CA8" : "#4FC3F7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Inventory Alerts */}
      <motion.div variants={cardVariants}>
        <Card
          className="p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(27, 108, 168, 0.15)',
            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
          }}
        >
          <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#F39C12]" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {inventoryAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{
                  background: alert.status === "CRITICAL" 
                    ? 'rgba(231, 76, 60, 0.05)' 
                    : 'rgba(243, 156, 18, 0.05)',
                  borderColor: alert.status === "CRITICAL"
                    ? 'rgba(231, 76, 60, 0.2)'
                    : 'rgba(243, 156, 18, 0.2)',
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: alert.status === "CRITICAL"
                        ? 'rgba(231, 76, 60, 0.1)'
                        : 'rgba(243, 156, 18, 0.1)',
                    }}
                  >
                    <Pill className={`h-5 w-5 ${alert.status === "CRITICAL" ? "text-[#E74C3C]" : "text-[#F39C12]"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2342]">{alert.name}</p>
                    <p className="text-sm text-[#5A6A85]">
                      Current: {alert.current} | Threshold: {alert.threshold}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    alert.status === "CRITICAL"
                      ? "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30 font-semibold"
                      : "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30 font-semibold"
                  }
                >
                  {alert.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
});

AnalyticsTab.displayName = "AnalyticsTab";
