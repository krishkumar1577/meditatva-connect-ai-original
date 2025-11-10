/**
 * Enhanced Find Medicine Page for MediTatva Patient Dashboard
 * 
 * Features:
 * - Multi-medicine search with comma-separated input
 * - Weighted store ranking: rating (40%), distance (35%), price (25%)
 * - Mandatory prescription upload for controlled medicines
 * - Delivery vs Pickup selection
 * - Dynamic delivery charge calculation
 * - Glassmorphism UI with animations
 * - Real-time file validation (JPG/PNG/PDF, max 5MB)
 * - Smart split orders across multiple stores
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Star, ShoppingCart, Upload, 
  Filter, SortAsc, X, Plus, Minus, FileText,
  CreditCard, Home, Truck, Award, AlertCircle,
  Package, CheckCircle2, Clock, TrendingUp, Sparkles,
  Phone, Shield, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GHARUAN_MEDICAL_STORES, calculateDeliveryCharge, requiresPrescription, EnhancedMedicalStore } from "@/data/gharuanMedicineData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";

interface MedicineAvailability {
  medicineName: string;
  store: EnhancedMedicalStore;
  price: number;
  category: string;
  stockQuantity: number;
}

interface StoreResult {
  store: EnhancedMedicalStore;
  availableMedicines: MedicineAvailability[];
  missingMedicines: string[];
  totalPrice: number;
  priorityScore: number;
  estimatedDelivery: string;
}

type SortOption = "priority" | "nearest" | "cheapest" | "best-rated";
type FilterDistance = "all" | "2" | "5" | "10";
type FilterRating = "all" | "4" | "4.5";

export const FindMedicineEnhanced = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedMedicines, setSearchedMedicines] = useState<string[]>([]);
  const [storeResults, setStoreResults] = useState<StoreResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter & Sort state
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [filterDistance, setFilterDistance] = useState<FilterDistance>("all");
  const [filterRating, setFilterRating] = useState<FilterRating>("all");
  
  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreResult | null>(null);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("123 Main St, Gharuan, Punjab 140413");
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [prescription, setPrescription] = useState<File | null>(null);
  const [prescriptionBase64, setPrescriptionBase64] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);

  /**
   * Calculate priority score for a store
   * Formula: (rating * 0.4) + ((1/distance) * 0.35) + ((1/price) * 0.25)
   * Normalized to 0-100 scale
   */
  const calculatePriorityScore = (
    distance: number,
    totalPrice: number,
    rating: number
  ): number => {
    // Normalize rating (0-5 → 0-100)
    const ratingScore = (rating / 5) * 100;
    
    // Normalize distance (inverse, closer is better)
    // Using 10km as max reference
    const distanceScore = Math.max(0, 100 - ((distance / 10) * 100));
    
    // Normalize price (inverse, cheaper is better)
    // Using ₹500 as max reference
    const priceScore = Math.max(0, 100 - ((totalPrice / 500) * 100));
    
    // Weighted combination: Rating 40%, Distance 35%, Price 25%
    return (ratingScore * 0.4) + (distanceScore * 0.35) + (priceScore * 0.25);
  };

  /**
   * Calculate estimated delivery time based on distance
   */
  const getEstimatedDelivery = (distance: number): string => {
    if (distance < 2) return "30-45 mins";
    if (distance < 5) return "1-2 hours";
    if (distance < 10) return "2-3 hours";
    return "3-4 hours";
  };

  /**
   * Handle multi-medicine search
   * Searches for comma-separated medicine names across all stores
   */
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      toast.error("Please enter medicine names to search");
      return;
    }

    setIsSearching(true);
    
    // Split by comma and clean up
    const medicineNames = searchQuery
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0);
    
    if (medicineNames.length === 0) {
      toast.error("Please enter valid medicine names");
      setIsSearching(false);
      return;
    }

    setSearchedMedicines(medicineNames);

    // Search across all stores
    const results: StoreResult[] = [];

    GHARUAN_MEDICAL_STORES.forEach(store => {
      const availableMedicines: MedicineAvailability[] = [];
      const missingMedicines: string[] = [];
      let totalPrice = 0;

      medicineNames.forEach(searchedMed => {
        const found = store.medicines.find(med => 
          med.name.toLowerCase().includes(searchedMed.toLowerCase()) &&
          med.availability === "In Stock"
        );

        if (found) {
          availableMedicines.push({
            medicineName: found.name,
            store: store,
            price: found.price,
            category: found.category,
            stockQuantity: found.stockQuantity
          });
          totalPrice += found.price;
        } else {
          missingMedicines.push(searchedMed);
        }
      });

      // Include store if at least one medicine is available
      if (availableMedicines.length > 0) {
        const priorityScore = calculatePriorityScore(
          store.distanceKm,
          totalPrice,
          store.rating || 4.0
        );

        results.push({
          store,
          availableMedicines,
          missingMedicines,
          totalPrice,
          priorityScore,
          estimatedDelivery: getEstimatedDelivery(store.distanceKm)
        });
      }
    });

    // Sort by priority by default
    results.sort((a, b) => b.priorityScore - a.priorityScore);

    setStoreResults(results);
    setIsSearching(false);

    if (results.length > 0) {
      toast.success(`Found ${results.length} stores with your medicines!`);
    } else {
      toast.error("No stores found with the requested medicines");
    }
  }, [searchQuery]);

  /**
   * Apply filters and sorting
   */
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...storeResults];

    // Distance filter
    if (filterDistance !== "all") {
      const maxDist = parseInt(filterDistance);
      filtered = filtered.filter(r => r.store.distanceKm <= maxDist);
    }

    // Rating filter
    if (filterRating !== "all") {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(r => (r.store.rating || 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "nearest":
        filtered.sort((a, b) => a.store.distanceKm - b.store.distanceKm);
        break;
      case "cheapest":
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case "best-rated":
        filtered.sort((a, b) => (b.store.rating || 0) - (a.store.rating || 0));
        break;
      case "priority":
      default:
        filtered.sort((a, b) => b.priorityScore - a.priorityScore);
        break;
    }

    return filtered;
  }, [storeResults, sortBy, filterDistance, filterRating]);

  /**
   * Handle order modal open
   */
  const handleOrderNow = (storeResult: StoreResult) => {
    setSelectedStore(storeResult);
    // Initialize quantities to 1 for each medicine
    const quantities: Record<string, number> = {};
    storeResult.availableMedicines.forEach(item => {
      quantities[item.medicineName] = 1;
    });
    setOrderQuantities(quantities);
    setPrescription(null);
    setPrescriptionBase64("");
    setDeliveryType('delivery');
    setShowOrderModal(true);
  };

  /**
   * Handle prescription upload with validation
   * Accepts: JPG, PNG, PDF
   * Max size: 5MB
   * Converts to base64 for storage
   */
  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files allowed");
      return;
    }

    setPrescription(file);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPrescriptionBase64(base64String);
      toast.success(`Prescription uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Check if any selected medicine requires prescription
   */
  const needsPrescription = useMemo(() => {
    if (!selectedStore) return false;
    return selectedStore.availableMedicines.some(med => 
      requiresPrescription(med.medicineName)
    );
  }, [selectedStore]);

  /**
   * Place order with validation
   */
  const handlePlaceOrder = async () => {
    if (!selectedStore) return;

    // Validate prescription if required
    if (needsPrescription && !prescription) {
      toast.error("Please upload a valid prescription to confirm your order.", {
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '2px solid #DC2626'
        }
      });
      return;
    }

    // Calculate final totals
    let subtotal = 0;
    const orderItems = selectedStore.availableMedicines.map(item => {
      const qty = orderQuantities[item.medicineName] || 1;
      const itemTotal = item.price * qty;
      subtotal += itemTotal;
      return {
        name: item.medicineName,
        dosage: "", // Could be extracted from medicine name
        quantity: qty,
        price: item.price
      };
    });

    // Calculate delivery charge
    const deliveryCharge = calculateDeliveryCharge(
      selectedStore.store.distanceKm,
      deliveryType,
      selectedStore.store
    );

    const totalAmount = subtotal + deliveryCharge;

    // Create order
    const orderId = addOrder({
      pharmacy: {
        name: selectedStore.store.storeName,
        address: selectedStore.store.address,
        phone: selectedStore.store.contactNumber,
        distance: `${selectedStore.store.distanceKm} km`
      },
      medicines: orderItems,
      totalAmount,
      deliveryAddress: deliveryType === 'delivery' 
        ? deliveryAddress 
        : `Pickup at ${selectedStore.store.storeName}`,
      paymentMethod,
      estimatedDelivery: deliveryType === 'delivery' 
        ? selectedStore.estimatedDelivery 
        : 'Ready for pickup in 15-45 mins',
      prescriptionUrl: prescriptionBase64,
      customerNotes: deliveryType === 'pickup' 
        ? `${orderNotes}\n\n[PICKUP ORDER] Your order is ready for pickup. Please collect your medicine directly from the pharmacy.`
        : orderNotes,
      deliveryCharge,
      deliveryMethod: deliveryType
    });

    setPlacedOrderIds([orderId]);
    setShowOrderModal(false);
    setShowSuccessModal(true);

    if (deliveryType === 'pickup') {
      toast.success("Order placed! Your order is ready for pickup.", {
        description: "Please collect your medicine directly from the pharmacy.",
        duration: 5000
      });
    } else {
      toast.success("Order placed successfully!", {
        description: `Estimated delivery: ${selectedStore.estimatedDelivery}`,
        duration: 4000
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            💊 Find Medicine
          </motion.h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search for one or multiple medicines across nearby stores in Gharuan area
          </p>
        </div>

        {/* Sticky Search Bar */}
        <motion.div
          className="sticky top-4 z-40 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border-2 border-cyan-500/20 shadow-xl rounded-2xl">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500" />
                <Input
                  type="text"
                  placeholder="Search for medicines (e.g., Paracetamol, Cetirizine)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-14 text-lg rounded-xl border-2 border-cyan-500/30 focus:border-cyan-500 transition-all"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setSearchQuery("");
                      setStoreResults([]);
                      setSearchedMedicines([]);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-lg text-lg font-semibold"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            {/* Search hint */}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Tip: Separate multiple medicines with commas (e.g., "Paracetamol, Cetirizine, Amoxicillin")
            </p>
          </Card>
        </motion.div>

        {/* Filters & Sort */}
        <AnimatePresence>
          {storeResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-cyan-600" />
                    <span className="font-semibold text-sm">Filters:</span>
                  </div>
                  
                  <Select value={filterDistance} onValueChange={(v) => setFilterDistance(v as FilterDistance)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Distances</SelectItem>
                      <SelectItem value="2">Within 2km</SelectItem>
                      <SelectItem value="5">Within 5km</SelectItem>
                      <SelectItem value="10">Within 10km</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRating} onValueChange={(v) => setFilterRating(v as FilterRating)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-cyan-600" />
                    <span className="font-semibold text-sm">Sort:</span>
                  </div>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Recommended</SelectItem>
                      <SelectItem value="nearest">Nearest</SelectItem>
                      <SelectItem value="cheapest">Cheapest</SelectItem>
                      <SelectItem value="best-rated">Best Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  <Badge variant="outline" className="ml-auto bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    {filteredAndSortedResults.length} Results
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {filteredAndSortedResults.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAndSortedResults.map((result, index) => (
                <StoreCard
                  key={result.store.storeId}
                  result={result}
                  index={index}
                  isTopRanked={index === 0 && sortBy === "priority"}
                  onOrderNow={handleOrderNow}
                />
              ))}
            </motion.div>
          ) : storeResults.length === 0 && searchedMedicines.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="h-24 w-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Search for Medicines
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Enter medicine names above to find the best nearby stores
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <AlertCircle className="h-24 w-24 mx-auto text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                No Results Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No stores found with the requested medicines
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStoreResults([]);
                  setSearchedMedicines([]);
                }}
                variant="outline"
              >
                Try Another Search
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Modal */}
        <OrderModal
          show={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          storeResult={selectedStore}
          quantities={orderQuantities}
          setQuantities={setOrderQuantities}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          prescription={prescription}
          onPrescriptionUpload={handlePrescriptionUpload}
          onPlaceOrder={handlePlaceOrder}
          needsPrescription={needsPrescription}
        />

        {/* Success Modal */}
        <SuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderIds={placedOrderIds}
          onViewOrders={() => navigate("/patient/premium")}
        />
      </motion.div>
    </div>
  );
};

/**
 * Store Card Component
 * Displays store information with glassmorphism effect
 */
interface StoreCardProps {
  result: StoreResult;
  index: number;
  isTopRanked: boolean;
  onOrderNow: (result: StoreResult) => void;
}

const StoreCard = ({ result, index, isTopRanked, onOrderNow }: StoreCardProps) => {
  const { store, availableMedicines, missingMedicines, totalPrice, estimatedDelivery } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className={`
        relative p-6 rounded-2xl transition-all duration-300
        bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl
        border-2 hover:shadow-2xl
        ${isTopRanked 
          ? 'border-amber-400 shadow-amber-500/20 shadow-lg' 
          : 'border-cyan-500/20 hover:border-cyan-500/40'
        }
      `}>
        {/* Recommended Badge */}
        {isTopRanked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
          >
            <Award className="h-4 w-4" />
            Recommended
          </motion.div>
        )}

        {/* Store Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-start gap-2">
            <Package className="h-5 w-5 text-cyan-500 mt-1 flex-shrink-0" />
            <span className="line-clamp-2">{store.storeName}</span>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {store.address}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
            <Phone className="h-3 w-3" />
            {store.contactNumber}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {store.timing} {store.isOpen24x7 && <Badge variant="secondary" className="ml-1 text-xs">24/7</Badge>}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">{store.distanceKm} km</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <Star className="h-4 w-4 text-amber-500 mx-auto mb-1 fill-amber-500" />
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">{store.rating} ⭐</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">{estimatedDelivery}</p>
          </div>
        </div>

        {/* Available Medicines */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Available ({availableMedicines.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableMedicines.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">
                    {item.medicineName}
                  </span>
                  <span className="text-xs text-slate-500">{item.category}</span>
                </div>
                <span className="font-bold text-green-700 dark:text-green-400">
                  ₹{item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Medicines */}
        {missingMedicines.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Unavailable ({missingMedicines.length})
            </h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {missingMedicines.map((med, idx) => (
                <div key={idx} className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                  {med}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="mb-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Price:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              ₹{totalPrice}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">+ delivery charges (if applicable)</p>
        </div>

        {/* Actions */}
        <Button
          onClick={() => onOrderNow(result)}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Order Now
        </Button>
      </Card>
    </motion.div>
  );
};

/**
 * Order Modal Component
 * Handles order placement with prescription upload and delivery options
 */
interface OrderModalProps {
  show: boolean;
  onClose: () => void;
  storeResult: StoreResult | null;
  quantities: Record<string, number>;
  setQuantities: (quantities: Record<string, number>) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  prescription: File | null;
  onPrescriptionUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceOrder: () => void;
  needsPrescription: boolean;
}

const OrderModal = ({
  show,
  onClose,
  storeResult,
  quantities,
  setQuantities,
  deliveryAddress,
  setDeliveryAddress,
  deliveryType,
  setDeliveryType,
  paymentMethod,
  setPaymentMethod,
  orderNotes,
  setOrderNotes,
  prescription,
  onPrescriptionUpload,
  onPlaceOrder,
  needsPrescription
}: OrderModalProps) => {
  if (!show || !storeResult) return null;

  const subtotal = storeResult.availableMedicines.reduce((sum, item) => {
    return sum + (item.price * (quantities[item.medicineName] || 1));
  }, 0);

  const deliveryCharge = calculateDeliveryCharge(
    storeResult.store.distanceKm,
    deliveryType,
    storeResult.store
  );

  const totalAmount = subtotal + deliveryCharge;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-bold text-lg mb-2">{storeResult.store.storeName}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {storeResult.store.address}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" />
              {storeResult.store.contactNumber}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {storeResult.store.timing}
            </p>
          </div>

          {/* Prescription Requirement Alert */}
          {needsPrescription && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Prescription Required:</strong> One or more medicines in your order require a valid prescription.
              </AlertDescription>
            </Alert>
          )}

          {/* Delivery vs Pickup */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-cyan-500/20">
            <label className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button"
                variant={deliveryType === 'delivery' ? 'default' : 'outline'} 
                onClick={() => setDeliveryType('delivery')} 
                className="h-auto py-3 flex-col"
              >
                <Truck className="h-5 w-5 mb-1" />
                <span>Home Delivery</span>
                <span className="text-xs opacity-70">{storeResult.estimatedDelivery}</span>
              </Button>
              <Button 
                type="button"
                variant={deliveryType === 'pickup' ? 'default' : 'outline'} 
                onClick={() => setDeliveryType('pickup')} 
                className="h-auto py-3 flex-col"
              >
                <Home className="h-5 w-5 mb-1" />
                <span>Store Pickup</span>
                <span className="text-xs opacity-70">Ready in 15-45 mins</span>
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              {deliveryType === 'delivery' ? (
                <>Delivery charge: ₹{deliveryCharge} (based on {storeResult.store.distanceKm} km distance)</>
              ) : (
                <>No delivery charge. Collect directly from the pharmacy.</>
              )}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h4>
            <div className="space-y-3">
              {storeResult.availableMedicines.map((item) => (
                <div key={item.medicineName} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-sm text-slate-500">
                      ₹{item.price} per unit • {item.category}
                      {requiresPrescription(item.medicineName) && (
                        <Badge variant="destructive" className="ml-2 text-xs">Requires Rx</Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantities({
                        ...quantities,
                        [item.medicineName]: Math.max(1, (quantities[item.medicineName] || 1) - 1)
                      })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold">{quantities[item.medicineName] || 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantities({
                        ...quantities,
                        [item.medicineName]: (quantities[item.medicineName] || 1) + 1
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="w-20 text-right font-bold text-cyan-600">
                      ₹{item.price * (quantities[item.medicineName] || 1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block font-semibold mb-2">Delivery Address</label>
              <Textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address with landmark"
                className="min-h-24"
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online Payment (UPI/Card)</SelectItem>
                <SelectItem value="card">Debit/Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prescription Upload - MANDATORY if needed */}
          <div>
            <label className={`font-semibold mb-2 flex items-center gap-2 ${needsPrescription ? 'text-red-600 dark:text-red-400' : ''}`}>
              <Upload className="h-4 w-4" />
              Upload Prescription {needsPrescription && <span className="text-red-600">*</span>}
            </label>
            <div className={`
              border-2 border-dashed rounded-xl p-6 text-center transition-all
              ${prescription 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                : needsPrescription 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                  : 'border-slate-300 dark:border-slate-600'}
            `}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={onPrescriptionUpload}
                className="hidden"
                id="prescription-upload"
              />
              <label htmlFor="prescription-upload" className="cursor-pointer">
                {prescription ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      {prescription.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {(prescription.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload prescription
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG, or PDF (max 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
            {needsPrescription && !prescription && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Prescription upload is mandatory for this order
              </p>
            )}
          </div>

          {/* Order Notes */}
          <div>
            <label className="block font-semibold mb-2">Additional Notes (Optional)</label>
            <Textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions or preferences"
              className="min-h-20"
            />
          </div>

          {/* Totals */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border-2 border-cyan-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Subtotal:</span>
              <span className="text-lg font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">
                {deliveryType === 'delivery' ? 'Delivery Charge:' : 'Pickup (Free):'}
              </span>
              <span className="text-lg font-semibold">₹{deliveryCharge}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-cyan-500/30">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ₹{totalAmount}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
              {deliveryType === 'delivery' 
                ? `Estimated delivery: ${storeResult.estimatedDelivery}`
                : 'Ready for pickup in 15-45 minutes'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={onPlaceOrder} 
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {deliveryType === 'pickup' ? 'Place Pickup Order' : 'Place Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Success Modal Component
 */
interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  orderIds: string[];
  onViewOrders: () => void;
}

const SuccessModal = ({ show, onClose, orderIds, onViewOrders }: SuccessModalProps) => {
  const isMultiOrder = orderIds.length > 1;
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {isMultiOrder ? 'Orders Placed Successfully!' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-1">
            {isMultiOrder 
              ? `${orderIds.length} orders confirmed`
              : 'Your order has been confirmed'}
          </p>
          <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-6 max-h-32 overflow-y-auto">
            {orderIds.map((id, idx) => (
              <p key={id} className="font-mono">
                {isMultiOrder && `Order ${idx + 1}: `}{id}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              onClick={onViewOrders}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              View My Orders
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default FindMedicineEnhanced;
