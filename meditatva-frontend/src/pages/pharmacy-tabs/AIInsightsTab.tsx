import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain, TrendingUp, TrendingDown, Package, AlertTriangle,
  DollarSign, Activity, Zap, MessageCircle, Send, X,
  ArrowUp, ArrowDown, Minus, Calendar, BarChart3, PieChart,
  ShoppingCart, Clock, Sparkles, Target, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
};

// AI-Powered Data
const demandForecast = [
  { medicine: "Paracetamol", current: 45, predicted: 68, change: 51, trend: "up" },
  { medicine: "Cetirizine", current: 32, predicted: 52, change: 62, trend: "up" },
  { medicine: "Ibuprofen", current: 28, predicted: 35, change: 25, trend: "up" },
  { medicine: "Amoxicillin", current: 24, predicted: 18, change: -25, trend: "down" },
  { medicine: "Vitamin C", current: 38, predicted: 42, change: 10, trend: "up" },
];

const stockOptimization = [
  { id: 1, medicine: "Cetirizine 10mg", action: "Restock Now", priority: "high", quantity: 150, reason: "High demand + Low stock" },
  { id: 2, medicine: "Paracetamol 500mg", action: "Restock Soon", priority: "medium", quantity: 100, reason: "Seasonal spike expected" },
  { id: 3, medicine: "Amoxicillin 250mg", action: "Reduce Orders", priority: "low", quantity: -50, reason: "Slow moving inventory" },
  { id: 4, medicine: "Omeprazole 20mg", action: "Optimize Stock", priority: "medium", quantity: 75, reason: "Steady demand pattern" },
];

const purchaseTrends = [
  { combo: "Paracetamol + Cetirizine", frequency: 145, percentage: 28 },
  { combo: "Ibuprofen + Omeprazole", frequency: 98, percentage: 19 },
  { combo: "Vitamin C + Zinc", frequency: 87, percentage: 17 },
  { combo: "Cough Syrup + Lozenges", frequency: 72, percentage: 14 },
  { combo: "Others", frequency: 113, percentage: 22 },
];

const expiryAlerts = [
  { id: 1, medicine: "Azithromycin 500mg", batch: "AZ2401", expiryDate: "2025-11-15", daysLeft: 8, stock: 45, risk: "critical" },
  { id: 2, medicine: "Cetirizine 10mg", batch: "CT2402", expiryDate: "2025-11-25", daysLeft: 18, stock: 28, risk: "high" },
  { id: 3, medicine: "Vitamin D3", batch: "VD2403", expiryDate: "2025-12-10", daysLeft: 33, stock: 62, risk: "medium" },
  { id: 4, medicine: "Paracetamol 650mg", batch: "PC2404", expiryDate: "2025-12-20", daysLeft: 43, stock: 120, risk: "low" },
];

const revenueForecast = [
  { week: "Week 1", actual: 45000, predicted: 47000 },
  { week: "Week 2", actual: 52000, predicted: 54000 },
  { week: "Week 3", actual: 48000, predicted: 51000 },
  { week: "Week 4", actual: 61000, predicted: 65000 },
  { week: "Week 5", predicted: 68000 },
  { week: "Week 6", predicted: 72000 },
];

const healthTrends = [
  { condition: "Cold & Flu", cases: 245, change: 45, medicines: ["Paracetamol", "Cetirizine"] },
  { condition: "Allergies", cases: 178, change: 32, medicines: ["Cetirizine", "Montelukast"] },
  { condition: "Digestive Issues", cases: 142, change: -12, medicines: ["Omeprazole", "Antacids"] },
  { condition: "Pain Relief", cases: 198, change: 18, medicines: ["Ibuprofen", "Diclofenac"] },
];

const trendingMedicines = [
  { name: "Paracetamol", value: 340 },
  { name: "Cetirizine", value: 280 },
  { name: "Ibuprofen", value: 220 },
  { name: "Omeprazole", value: 180 },
  { name: "Others", value: 320 },
];

const COLORS = ['#1B6CA8', '#4FC3F7', '#2ECC71', '#F39C12', '#E74C3C'];

const aiSummary = {
  weeklyChange: 12,
  inventoryTurnover: 8,
  topSeller: "Paracetamol",
  criticalAlerts: 2,
  revenueGrowth: 15,
  optimizationScore: 87,
};

const chatbotResponses: { [key: string]: string } = {
  "painkillers": "Paracetamol is selling most with 340 units this week (↑12%). Ibuprofen follows with 220 units.",
  "expiry": "2 medicines have critical expiry risk: Azithromycin (8 days) and Cetirizine (18 days). Recommend flash sale.",
  "revenue": "Predicted revenue for next week is ₹68,000 (↑11%). Month-end forecast: ₹2.8L (↑15%).",
  "restock": "AI suggests restocking: Cetirizine (150 units - HIGH priority), Paracetamol (100 units - MEDIUM priority).",
  "trending": "Cold & Flu cases up 45% in your area. Stock up on Paracetamol, Cetirizine, and Cough syrups.",
  "slow": "Amoxicillin is slow-moving (-25% demand). Consider reducing next order by 50 units.",
};

export const AIInsightsTab = memo(() => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'ai', text: string }>>([
    { type: 'ai', text: "👋 Hi! I'm your AI Pharmacy Assistant. Ask me about sales, inventory, expiry risks, or trends!" }
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);

    // Simple AI response matching
    let aiResponse = "I'm analyzing your data... ";
    
    if (userMessage.includes('painkiller') || userMessage.includes('pain')) {
      aiResponse = chatbotResponses.painkillers;
    } else if (userMessage.includes('expiry') || userMessage.includes('expire')) {
      aiResponse = chatbotResponses.expiry;
    } else if (userMessage.includes('revenue') || userMessage.includes('sales')) {
      aiResponse = chatbotResponses.revenue;
    } else if (userMessage.includes('restock') || userMessage.includes('stock')) {
      aiResponse = chatbotResponses.restock;
    } else if (userMessage.includes('trend') || userMessage.includes('area')) {
      aiResponse = chatbotResponses.trending;
    } else if (userMessage.includes('slow')) {
      aiResponse = chatbotResponses.slow;
    } else {
      aiResponse = "I can help you with: Sales trends, Expiry alerts, Revenue forecasts, Restocking suggestions, Health trends in your area, and Slow-moving inventory. What would you like to know?";
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
    }, 500);

    setChatInput("");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 relative"
    >
      {/* AI Summary Banner */}
      <motion.div variants={cardVariants}>
        <Card
          className="p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
            border: 'none',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
                    <p className="text-white/80 text-sm">Real-time analytics and predictions</p>
                  </div>
                </div>
                <p className="text-white text-lg leading-relaxed">
                  <strong>{aiSummary.topSeller}</strong> saw a <strong>{aiSummary.weeklyChange}% rise</strong> this week. 
                  Inventory turnover improved by <strong>{aiSummary.inventoryTurnover}%</strong>. 
                  You have <strong>{aiSummary.criticalAlerts} critical alerts</strong> requiring immediate attention.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">{aiSummary.optimizationScore}%</div>
                  <div className="text-white/80 text-xs font-semibold">AI Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#5A6A85]">Revenue Growth</span>
                </div>
                <div className="text-3xl font-bold text-[#0A2342]">{aiSummary.revenueGrowth}%</div>
                <div className="flex items-center gap-1 text-sm text-[#2ECC71] mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>vs last month</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#5A6A85]">Expiry Alerts</span>
                </div>
                <div className="text-3xl font-bold text-[#0A2342]">{aiSummary.criticalAlerts}</div>
                <div className="text-sm text-[#F39C12] mt-1">Critical attention needed</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#5A6A85]">Turnover Rate</span>
                </div>
                <div className="text-3xl font-bold text-[#0A2342]">{aiSummary.inventoryTurnover}%</div>
                <div className="flex items-center gap-1 text-sm text-[#2ECC71] mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>Improved efficiency</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#5A6A85]">AI Optimization</span>
                </div>
                <div className="text-3xl font-bold text-[#0A2342]">{aiSummary.optimizationScore}%</div>
                <div className="text-sm text-[#5A6A85] mt-1">Overall score</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Demand Prediction */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A2342]">Demand Forecast</h3>
                  <p className="text-xs text-[#5A6A85]">AI-predicted next 7 days</p>
                </div>
              </div>
              <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <div className="space-y-3">
              {demandForecast.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] hover:bg-[#E8F4F8] transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A2342]">{item.medicine}</p>
                    <p className="text-xs text-[#5A6A85]">Current: {item.current} units</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-[#1B6CA8]">{item.predicted}</p>
                    <p className="text-xs text-[#5A6A85]">Predicted</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    item.trend === 'up' 
                      ? 'bg-[#2ECC71]/10 text-[#2ECC71]' 
                      : 'bg-[#E74C3C]/10 text-[#E74C3C]'
                  }`}>
                    {item.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span className="text-sm font-bold">{Math.abs(item.change)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Revenue Forecast Chart */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Revenue Forecast</h3>
                <p className="text-xs text-[#5A6A85]">Actual vs Predicted</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueForecast}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B6CA8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1B6CA8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="week" stroke="#5A6A85" />
                <YAxis stroke="#5A6A85" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#1B6CA8"
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                  name="Actual Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2ECC71"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Stock Optimization & Purchase Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Optimization */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Stock Optimization</h3>
                <p className="text-xs text-[#5A6A85]">AI-recommended actions</p>
              </div>
            </div>
            <div className="space-y-3">
              {stockOptimization.map((item) => (
                <motion.div
                  key={item.id}
                  className="p-4 rounded-lg border-2 hover:shadow-md transition-all"
                  style={{
                    borderColor: item.priority === 'high' 
                      ? 'rgba(231, 76, 60, 0.3)'
                      : item.priority === 'medium'
                      ? 'rgba(243, 156, 18, 0.3)'
                      : 'rgba(52, 152, 219, 0.3)',
                    background: item.priority === 'high'
                      ? 'rgba(231, 76, 60, 0.05)'
                      : item.priority === 'medium'
                      ? 'rgba(243, 156, 18, 0.05)'
                      : 'rgba(52, 152, 219, 0.05)',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          item.priority === 'high'
                            ? 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30'
                            : item.priority === 'medium'
                            ? 'bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30'
                            : 'bg-[#3498DB]/10 text-[#3498DB] border-[#3498DB]/30'
                        }>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-[#5A6A85]">{item.action}</span>
                      </div>
                      <p className="font-bold text-[#0A2342]">{item.medicine}</p>
                      <p className="text-sm text-[#5A6A85] mt-1">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${item.quantity > 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                        {item.quantity > 0 ? '+' : ''}{item.quantity}
                      </div>
                      <div className="text-xs text-[#5A6A85]">units</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Purchase Trends Pie Chart */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#E74C3C] to-[#C0392B] flex items-center justify-center">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Purchase Trends</h3>
                <p className="text-xs text-[#5A6A85]">Most bought combinations</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={trendingMedicines}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const total = trendingMedicines.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((entry.value / total) * 100).toFixed(0);
                    return `${entry.name} ${percentage}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trendingMedicines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {purchaseTrends.slice(0, 4).map((trend, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-[#F7F9FC] rounded-lg">
                  <div className="h-3 w-3 rounded-full" style={{ background: COLORS[index] }} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0A2342] truncate">{trend.combo}</p>
                    <p className="text-xs text-[#5A6A85]">{trend.frequency} purchases</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Expiry Alerts & Health Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Risk Alerts */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#E74C3C] to-[#C0392B] flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Expiry Risk Alerts</h3>
                <p className="text-xs text-[#5A6A85]">Medicines expiring soon</p>
              </div>
            </div>
            <div className="space-y-3">
              {expiryAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: alert.risk === 'critical'
                      ? 'rgba(231, 76, 60, 0.1)'
                      : alert.risk === 'high'
                      ? 'rgba(243, 156, 18, 0.1)'
                      : alert.risk === 'medium'
                      ? 'rgba(52, 152, 219, 0.1)'
                      : 'rgba(46, 204, 113, 0.1)',
                    border: `2px solid ${
                      alert.risk === 'critical'
                        ? 'rgba(231, 76, 60, 0.3)'
                        : alert.risk === 'high'
                        ? 'rgba(243, 156, 18, 0.3)'
                        : alert.risk === 'medium'
                        ? 'rgba(52, 152, 219, 0.3)'
                        : 'rgba(46, 204, 113, 0.3)'
                    }`,
                  }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p className="font-bold text-[#0A2342]">{alert.medicine}</p>
                    <p className="text-xs text-[#5A6A85]">Batch: {alert.batch} • Stock: {alert.stock} units</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-bold ${
                      alert.risk === 'critical' ? 'text-[#E74C3C]' :
                      alert.risk === 'high' ? 'text-[#F39C12]' :
                      alert.risk === 'medium' ? 'text-[#3498DB]' : 'text-[#2ECC71]'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      <span>{alert.daysLeft} days</span>
                    </div>
                    <p className="text-xs text-[#5A6A85]">{alert.expiryDate}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Health Trends in Area */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#4FC3F7]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Health Trends in Your Area</h3>
                <p className="text-xs text-[#5A6A85]">Trending conditions & medicines</p>
              </div>
            </div>
            <div className="space-y-3">
              {healthTrends.map((trend, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg bg-gradient-to-r from-[#F7F9FC] to-[#E8F4F8] border border-[#4FC3F7]/20 hover:border-[#4FC3F7]/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-[#0A2342]">{trend.condition}</p>
                      <p className="text-sm text-[#5A6A85]">{trend.cases} cases reported</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      trend.change > 0
                        ? 'bg-[#E74C3C]/10 text-[#E74C3C]'
                        : 'bg-[#2ECC71]/10 text-[#2ECC71]'
                    }`}>
                      {trend.change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      <span className="text-sm font-bold">{Math.abs(trend.change)}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trend.medicines.map((med, i) => (
                      <Badge key={i} className="bg-[#1B6CA8]/10 text-[#1B6CA8] border-[#1B6CA8]/20">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Chatbot Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setChatOpen(!chatOpen)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
            }}
          >
            {chatOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* AI Chatbot Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed bottom-28 right-8 w-96 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-[#4FC3F7]/30">
              <div
                className="p-4 border-b"
                style={{
                  background: 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AI Pharmacy Assistant</h3>
                    <p className="text-xs text-white/80">Ask me anything!</p>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-3 bg-[#F7F9FC]">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white'
                          : 'bg-white text-[#0A2342] border border-[#4FC3F7]/20'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-[#4FC3F7]" />
                          <span className="text-xs font-bold text-[#5A6A85]">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about sales, expiry, trends..."
                    className="flex-1 border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AIInsightsTab.displayName = "AIInsightsTab";
