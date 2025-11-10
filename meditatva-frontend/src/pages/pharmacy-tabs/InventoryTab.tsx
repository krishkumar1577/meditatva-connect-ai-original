import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package, Search, Plus, Edit, Trash2, Download, Upload,
  Filter, TrendingUp, AlertTriangle, Calendar, DollarSign,
  PackageSearch, Barcode, FileSpreadsheet, RefreshCw,
  CheckCircle2, XCircle, Clock, Pill, ShoppingCart, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
};

interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  manufacturer: string;
  quantity: number;
  price: number;
  expiryDate: string;
  supplier: string;
  category: string;
  barcode?: string;
}

const initialInventory: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    batchNumber: "PC2401",
    manufacturer: "PharmaCo Ltd",
    quantity: 450,
    price: 2.50,
    expiryDate: "2026-08-15",
    supplier: "MediSupply Inc",
    category: "Pain Relief",
    barcode: "890123456789"
  },
  {
    id: 2,
    name: "Cetirizine 10mg",
    batchNumber: "CT2402",
    manufacturer: "AllergyMed",
    quantity: 28,
    price: 4.75,
    expiryDate: "2025-11-25",
    supplier: "Global Pharma",
    category: "Allergy",
    barcode: "890123456790"
  },
  {
    id: 3,
    name: "Ibuprofen 400mg",
    batchNumber: "IB2403",
    manufacturer: "PainFree Corp",
    quantity: 185,
    price: 3.20,
    expiryDate: "2026-03-20",
    supplier: "MediSupply Inc",
    category: "Pain Relief",
    barcode: "890123456791"
  },
  {
    id: 4,
    name: "Amoxicillin 250mg",
    batchNumber: "AX2404",
    manufacturer: "AntiBio Labs",
    quantity: 8,
    price: 8.90,
    expiryDate: "2025-11-10",
    supplier: "BioPharm Solutions",
    category: "Antibiotic",
    barcode: "890123456792"
  },
  {
    id: 5,
    name: "Omeprazole 20mg",
    batchNumber: "OM2405",
    manufacturer: "DigestCare",
    quantity: 320,
    price: 5.60,
    expiryDate: "2026-06-30",
    supplier: "Global Pharma",
    category: "Digestive",
    barcode: "890123456793"
  },
  {
    id: 6,
    name: "Azithromycin 500mg",
    batchNumber: "AZ2406",
    manufacturer: "AntiBio Labs",
    quantity: 45,
    price: 12.50,
    expiryDate: "2025-11-15",
    supplier: "BioPharm Solutions",
    category: "Antibiotic",
    barcode: "890123456794"
  },
  {
    id: 7,
    name: "Metformin 500mg",
    batchNumber: "MF2407",
    manufacturer: "DiabetesCare Inc",
    quantity: 0,
    price: 6.25,
    expiryDate: "2026-09-10",
    supplier: "MediSupply Inc",
    category: "Diabetes",
    barcode: "890123456795"
  },
  {
    id: 8,
    name: "Atorvastatin 10mg",
    batchNumber: "AT2408",
    manufacturer: "CardioMed",
    quantity: 210,
    price: 9.80,
    expiryDate: "2026-05-22",
    supplier: "Global Pharma",
    category: "Cardiovascular",
    barcode: "890123456796"
  },
];

const categories = ["All Categories", "Pain Relief", "Allergy", "Antibiotic", "Digestive", "Diabetes", "Cardiovascular"];

export const InventoryTab = memo(() => {
  const [inventory, setInventory] = useState<Medicine[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [expiryFilter, setExpiryFilter] = useState("All Expiry");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<Partial<Medicine>>({});

  // Calculate stock status
  const getStockStatus = (quantity: number): { status: string; color: string; icon: any } => {
    if (quantity === 0) return { status: "Out of Stock", color: "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30", icon: XCircle };
    if (quantity < 50) return { status: "Low Stock", color: "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30", icon: AlertTriangle };
    return { status: "In Stock", color: "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30", icon: CheckCircle2 };
  };

  // Calculate expiry status
  const getExpiryStatus = (expiryDate: string): { status: string; color: string; daysLeft: number } => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: "Expired", color: "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30", daysLeft };
    if (daysLeft < 30) return { status: "Expiring Soon", color: "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30", daysLeft };
    return { status: "Good", color: "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30", daysLeft };
  };

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
      
      const stockStatus = getStockStatus(item.quantity);
      const matchesStock = stockFilter === "All Stock" || stockStatus.status === stockFilter;
      
      const expiryStatus = getExpiryStatus(item.expiryDate);
      const matchesExpiry = expiryFilter === "All Expiry" || expiryStatus.status === expiryFilter;

      return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
    });
  }, [inventory, searchQuery, categoryFilter, stockFilter, expiryFilter]);

  // Low stock items
  const lowStockItems = useMemo(() => {
    return inventory
      .filter(item => item.quantity < 50 && item.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }, [inventory]);

  // Top seller calculation
  const topSeller = useMemo(() => {
    const sorted = [...inventory].sort((a, b) => b.quantity - a.quantity);
    return sorted[0];
  }, [inventory]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const lowStock = inventory.filter(item => item.quantity < 50 && item.quantity > 0).length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    const expiringSoon = inventory.filter(item => getExpiryStatus(item.expiryDate).daysLeft < 30 && getExpiryStatus(item.expiryDate).daysLeft >= 0).length;

    return { totalItems, totalValue, lowStock, outOfStock, expiringSoon };
  }, [inventory]);

  // Handle Add Medicine
  const handleAddMedicine = () => {
    if (!formData.name || !formData.batchNumber || !formData.quantity || !formData.price || !formData.expiryDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now(),
      name: formData.name,
      batchNumber: formData.batchNumber,
      manufacturer: formData.manufacturer || "",
      quantity: formData.quantity,
      price: formData.price,
      expiryDate: formData.expiryDate,
      supplier: formData.supplier || "",
      category: formData.category || "Other",
      barcode: formData.barcode,
    };

    setInventory([...inventory, newMedicine]);
    setShowAddDialog(false);
    setFormData({});
    toast.success(`${newMedicine.name} added successfully!`);
  };

  // Handle Edit Medicine
  const handleEditMedicine = () => {
    if (!selectedMedicine) return;

    const updated = inventory.map(item =>
      item.id === selectedMedicine.id ? { ...selectedMedicine, ...formData } : item
    );

    setInventory(updated);
    setShowEditDialog(false);
    setSelectedMedicine(null);
    setFormData({});
    toast.success("Medicine updated successfully!");
  };

  // Handle Delete Medicine
  const handleDeleteMedicine = () => {
    if (!selectedMedicine) return;

    setInventory(inventory.filter(item => item.id !== selectedMedicine.id));
    setShowDeleteDialog(false);
    setSelectedMedicine(null);
    toast.success("Medicine deleted successfully!");
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Name", "Batch Number", "Manufacturer", "Quantity", "Price", "Expiry Date", "Supplier", "Category"];
    const csvContent = [
      headers.join(","),
      ...filteredInventory.map(item =>
        [item.name, item.batchNumber, item.manufacturer, item.quantity, item.price, item.expiryDate, item.supplier, item.category].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Inventory exported successfully!");
  };

  // Import from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header
      
      const imported: Medicine[] = lines
        .filter(line => line.trim())
        .map((line, index) => {
          const [name, batchNumber, manufacturer, quantity, price, expiryDate, supplier, category] = line.split(",");
          return {
            id: Date.now() + index,
            name: name.trim(),
            batchNumber: batchNumber.trim(),
            manufacturer: manufacturer.trim(),
            quantity: parseInt(quantity.trim()),
            price: parseFloat(price.trim()),
            expiryDate: expiryDate.trim(),
            supplier: supplier.trim(),
            category: category.trim(),
          };
        });

      setInventory([...inventory, ...imported]);
      toast.success(`${imported.length} medicines imported successfully!`);
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Top Summary Banner */}
      <motion.div variants={cardVariants}>
        <Card
          className="p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
            border: 'none',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="text-white">
                <p className="text-sm opacity-90">Top Seller This Week</p>
                <p className="text-2xl font-bold">{topSeller?.name} — {topSeller?.quantity} units in stock</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Live Inventory
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6A85] font-semibold">Total Items</p>
                <p className="text-3xl font-bold text-[#0A2342]">{stats.totalItems}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6A85] font-semibold">Total Value</p>
                <p className="text-3xl font-bold text-[#0A2342]">₹{stats.totalValue.toFixed(0)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6A85] font-semibold">Low Stock</p>
                <p className="text-3xl font-bold text-[#F39C12]">{stats.lowStock}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6A85] font-semibold">Out of Stock</p>
                <p className="text-3xl font-bold text-[#E74C3C]">{stats.outOfStock}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#E74C3C] to-[#C0392B] flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white border-[#4FC3F7]/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6A85] font-semibold">Expiring Soon</p>
                <p className="text-3xl font-bold text-[#F39C12]">{stats.expiringSoon}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Recommendations */}
      {lowStockItems.length > 0 && (
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white border-[#F39C12]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2342]">Low Stock Alerts</h3>
                <p className="text-sm text-[#5A6A85]">Top 5 items that need restocking</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {lowStockItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#FFF3E0] border-2 border-[#F39C12]/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-bold text-[#0A2342] text-sm mb-1">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#F39C12]">{item.quantity}</p>
                    <Badge className="bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30">
                      Low
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div variants={cardVariants}>
        <Card className="p-6 bg-white border-[#4FC3F7]/20">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5A6A85]" />
                <Input
                  placeholder="Search by medicine name, batch number, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-[#4FC3F7]/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[150px] border-[#4FC3F7]/30">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Stock">All Stock</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-[150px] border-[#4FC3F7]/30">
                <SelectValue placeholder="Expiry Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Expiry">All Expiry</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <label htmlFor="import-csv">
              <Button
                variant="outline"
                className="border-[#1B6CA8] text-[#1B6CA8] hover:bg-[#1B6CA8]/10"
                onClick={() => document.getElementById('import-csv')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </label>
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </div>
        </Card>
      </motion.div>

      {/* Inventory Table */}
      <motion.div variants={cardVariants}>
        <Card className="overflow-hidden border-[#4FC3F7]/20">
          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center">
              <PackageSearch className="h-20 w-20 text-[#4FC3F7] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#0A2342] mb-2">No medicines found</h3>
              <p className="text-[#5A6A85] mb-4">Try adjusting your search or filters</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All Categories");
                  setStockFilter("All Stock");
                  setExpiryFilter("All Expiry");
                }}
                variant="outline"
                className="border-[#1B6CA8] text-[#1B6CA8]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#E8F4F8] to-[#F7F9FC] border-b-2 border-[#4FC3F7]/20">
                    <th className="text-left p-4 font-bold text-[#0A2342]">Medicine Name</th>
                    <th className="text-left p-4 font-bold text-[#0A2342]">Batch Number</th>
                    <th className="text-left p-4 font-bold text-[#0A2342]">Manufacturer</th>
                    <th className="text-center p-4 font-bold text-[#0A2342]">Quantity</th>
                    <th className="text-left p-4 font-bold text-[#0A2342]">Price</th>
                    <th className="text-left p-4 font-bold text-[#0A2342]">Expiry Date</th>
                    <th className="text-left p-4 font-bold text-[#0A2342]">Supplier</th>
                    <th className="text-center p-4 font-bold text-[#0A2342]">Status</th>
                    <th className="text-center p-4 font-bold text-[#0A2342]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredInventory.map((item, index) => {
                      const stockStatus = getStockStatus(item.quantity);
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      const StockIcon = stockStatus.icon;

                      return (
                        <motion.tr
                          key={item.id}
                          className="border-b border-[#E0E0E0] hover:bg-[#F7F9FC] transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                                <Pill className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#0A2342]">{item.name}</p>
                                <p className="text-xs text-[#5A6A85]">{item.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Barcode className="h-4 w-4 text-[#5A6A85]" />
                              <span className="text-sm font-mono text-[#0A2342]">{item.batchNumber}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-[#5A6A85]">{item.manufacturer}</td>
                          <td className="p-4 text-center">
                            <Badge className={stockStatus.color}>
                              <StockIcon className="h-3 w-3 mr-1" />
                              {item.quantity}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-bold text-[#0A2342]">₹{item.price.toFixed(2)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-[#0A2342]">{item.expiryDate}</span>
                              <Badge className={`${expiryStatus.color} text-xs`}>
                                {expiryStatus.daysLeft >= 0 ? `${expiryStatus.daysLeft} days` : "Expired"}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-[#5A6A85]">{item.supplier}</td>
                          <td className="p-4 text-center">
                            <Badge className={stockStatus.color}>
                              {stockStatus.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedMedicine(item);
                                  setFormData(item);
                                  setShowEditDialog(true);
                                }}
                                className="hover:bg-[#1B6CA8]/10"
                              >
                                <Edit className="h-4 w-4 text-[#1B6CA8]" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedMedicine(item);
                                  setShowDeleteDialog(true);
                                }}
                                className="hover:bg-[#E74C3C]/10"
                              >
                                <Trash2 className="h-4 w-4 text-[#E74C3C]" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0A2342]">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Add New Medicine
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new medicine to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Paracetamol 500mg"
              />
            </div>
            <div>
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber || ""}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g., PC2401"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode || ""}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g., 890123456789"
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer || ""}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., PharmaCo Ltd"
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g., MediSupply Inc"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 25.50"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMedicine}
              className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]"
            >
              Add Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0A2342]">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Edit Medicine
            </DialogTitle>
            <DialogDescription>
              Update the medicine details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Medicine Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-batchNumber">Batch Number *</Label>
              <Input
                id="edit-batchNumber"
                value={formData.batchNumber || ""}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-barcode">Barcode</Label>
              <Input
                id="edit-barcode"
                value={formData.barcode || ""}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-manufacturer">Manufacturer</Label>
              <Input
                id="edit-manufacturer"
                value={formData.manufacturer || ""}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantity *</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price (₹) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-expiryDate">Expiry Date *</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setFormData({});
              setSelectedMedicine(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleEditMedicine}
              className="bg-gradient-to-r from-[#F39C12] to-[#E67E22]"
            >
              Update Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#E74C3C]/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-[#E74C3C]" />
              </div>
              Delete Medicine
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMedicine(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedicine}
              className="bg-[#E74C3C] hover:bg-[#C0392B]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
});

InventoryTab.displayName = "InventoryTab";
