import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Star, ShoppingCart, Upload, 
  Filter, SortAsc, X, Plus, Minus, FileText,
  CreditCard, Home, Truck, Award, AlertCircle,
  Package, CheckCircle2, Clock, TrendingUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MEDICAL_STORES } from "@/data/medicalStoresData";
import { MedicalStore, MedicineStock } from "@/data/medicineData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";

interface MedicineSearchItem {
  name: string;
  selected: boolean;
}

interface StoreResult {
  store: MedicalStore;
  availableMedicines: {
    medicine: MedicineStock;
    requested: string;
  }[];
  missingMedicines: string[];
  totalPrice: number;
  priorityScore: number;
  estimatedDelivery: string;
}

type SortOption = "nearest" | "cheapest" | "best-rated" | "priority";
type FilterDistance = "all" | "2km" | "5km" | "10km";
type FilterRating = "all" | "4+" | "4.5+";

export const FindMedicineAdvanced = () => {
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
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  
  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreResult | null>(null);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("123 Main St, Gharuan, Punjab");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [prescription, setPrescription] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  
  // Multi-store split order state
  const [showSplitOrderModal, setShowSplitOrderModal] = useState(false);
  const [splitOrderPlan, setSplitOrderPlan] = useState<StoreResult[]>([]);
  const [splitOrderQuantities, setSplitOrderQuantities] = useState<Record<string, Record<string, number>>>({});
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);

  // Calculate priority score for a store
  const calculatePriorityScore = (
    distance: number,
    totalPrice: number,
    rating: number,
    avgPrice: number
  ): number => {
    // Normalize distance (0-10km → 100-0 score)
    const distanceScore = Math.max(0, 100 - (distance * 10));
    
    // Normalize price (lower is better, relative to average)
    const priceScore = avgPrice > 0 ? Math.max(0, 100 - ((totalPrice / avgPrice - 1) * 100)) : 50;
    
    // Normalize rating (0-5 → 0-100)
    const ratingScore = (rating / 5) * 100;
    
    // Weighted combination: Distance 40%, Price 35%, Rating 25%
    return (distanceScore * 0.4) + (priceScore * 0.35) + (ratingScore * 0.25);
  };

  // Calculate estimated delivery time based on distance
  const getEstimatedDelivery = (distance: number): string => {
    if (distance < 2) return "30-45 mins";
    if (distance < 5) return "1-2 hours";
    if (distance < 10) return "2-3 hours";
    return "3-4 hours";
  };

  // Handle multi-medicine search
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
    const allPrices: number[] = [];

    MEDICAL_STORES.forEach(store => {
      const availableMedicines: StoreResult['availableMedicines'] = [];
      const missingMedicines: string[] = [];
      let totalPrice = 0;

      medicineNames.forEach(searchedMed => {
        const found = store.medicines.find(med => 
          med.name.toLowerCase().includes(searchedMed.toLowerCase()) &&
          med.availability !== "Out of Stock"
        );

        if (found) {
          availableMedicines.push({
            medicine: found,
            requested: searchedMed
          });
          totalPrice += found.price;
        } else {
          missingMedicines.push(searchedMed);
        }
      });

      // Include store even if some medicines are missing
      if (availableMedicines.length > 0) {
        allPrices.push(totalPrice);
        results.push({
          store,
          availableMedicines,
          missingMedicines,
          totalPrice,
          priorityScore: 0, // Will calculate after we have average price
          estimatedDelivery: getEstimatedDelivery(store.distanceKm)
        });
      }
    });

    // Calculate average price for normalization
    const avgPrice = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;

    // Calculate priority scores
    results.forEach(result => {
      result.priorityScore = calculatePriorityScore(
        result.store.distanceKm,
        result.totalPrice,
        result.store.rating,
        avgPrice
      );
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

  // Apply filters and sorting
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
      filtered = filtered.filter(r => r.store.rating >= minRating);
    }

    // Price range filter
    if (filterPriceMin && !isNaN(Number(filterPriceMin))) {
      filtered = filtered.filter(r => r.totalPrice >= Number(filterPriceMin));
    }
    if (filterPriceMax && !isNaN(Number(filterPriceMax))) {
      filtered = filtered.filter(r => r.totalPrice <= Number(filterPriceMax));
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
        filtered.sort((a, b) => b.store.rating - a.store.rating);
        break;
      case "priority":
      default:
        filtered.sort((a, b) => b.priorityScore - a.priorityScore);
        break;
    }

    return filtered;
  }, [storeResults, sortBy, filterDistance, filterRating, filterPriceMin, filterPriceMax]);

  // Handle order modal open
  const handleOrderNow = (storeResult: StoreResult) => {
    setSelectedStore(storeResult);
    // Initialize quantities
    const quantities: Record<string, number> = {};
    storeResult.availableMedicines.forEach(item => {
      quantities[item.medicine.name] = 1;
    });
    setOrderQuantities(quantities);
    setShowOrderModal(true);
  };

  // Handle prescription upload
  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|pdf)$/)) {
        toast.error("Only JPG, PNG, or PDF files allowed");
        return;
      }
      setPrescription(file);
      toast.success(`Prescription uploaded: ${file.name}`);
    }
  };

  // Smart Split Order - finds optimal combination of stores to get all medicines
  const handleSmartSplitOrder = () => {
    if (searchedMedicines.length === 0) {
      toast.error("Please search for medicines first");
      return;
    }

    // Find which medicines are missing across all stores
    const allMedicines = new Set(searchedMedicines);
    const coveredMedicines = new Set<string>();
    
    storeResults.forEach(result => {
      result.availableMedicines.forEach(item => {
        coveredMedicines.add(item.requested);
      });
    });

    const uncoveredMedicines = Array.from(allMedicines).filter(m => !coveredMedicines.has(m));
    
    if (uncoveredMedicines.length > 0) {
      toast.error(`The following medicines are not available at any store: ${uncoveredMedicines.join(', ')}`);
      return;
    }

    // Greedy algorithm: pick stores that cover the most uncovered medicines with best priority score
    const plan: StoreResult[] = [];
    const remaining = new Set(searchedMedicines);
    const quantities: Record<string, Record<string, number>> = {};

    while (remaining.size > 0) {
      let bestStore: StoreResult | null = null;
      let bestCoverage = 0;
      let bestScore = -1;

      for (const result of storeResults) {
        const coverage = result.availableMedicines.filter(item => 
          remaining.has(item.requested)
        ).length;

        if (coverage > bestCoverage || (coverage === bestCoverage && result.priorityScore > bestScore)) {
          bestStore = result;
          bestCoverage = coverage;
          bestScore = result.priorityScore;
        }
      }

      if (!bestStore || bestCoverage === 0) break;

      // Add this store to the plan
      plan.push(bestStore);
      
      // Initialize quantities for this store
      quantities[bestStore.store.storeId] = {};
      
      // Mark medicines as covered
      bestStore.availableMedicines.forEach(item => {
        if (remaining.has(item.requested)) {
          remaining.delete(item.requested);
          quantities[bestStore!.store.storeId][item.medicine.name] = 1;
        }
      });
    }

    if (plan.length === 0) {
      toast.error("Could not create a split order plan");
      return;
    }

    if (plan.length === 1) {
      // Only one store needed, use regular order flow
      handleOrderNow(plan[0]);
      return;
    }

    setSplitOrderPlan(plan);
    setSplitOrderQuantities(quantities);
    setShowSplitOrderModal(true);
    
    toast.success(`Smart split: ${plan.length} stores needed to fulfill your order`);
  };

  // Place all orders in split order plan
  const handlePlaceSplitOrders = async () => {
    const orderIds: string[] = [];

    for (const storeResult of splitOrderPlan) {
      const storeQuantities = splitOrderQuantities[storeResult.store.storeId] || {};
      
      // Calculate subtotal for this store
      let subtotal = 0;
      const orderItems = storeResult.availableMedicines
        .filter(item => storeQuantities[item.medicine.name] > 0)
        .map(item => {
          const qty = storeQuantities[item.medicine.name];
          subtotal += item.medicine.price * qty;
          return {
            name: item.medicine.name,
            quantity: qty,
            price: item.medicine.price,
          };
        });

      // Calculate delivery charge
      const distance = storeResult.store.distanceKm;
      const deliveryCharge = distance < 2 ? 15 : Math.min(distance * 2, 40);
      const totalAmount = subtotal + deliveryCharge;

      const orderId = addOrder({
        pharmacy: {
          name: storeResult.store.storeName,
          address: storeResult.store.address,
          phone: storeResult.store.contactNumber,
          distance: `${storeResult.store.distanceKm} km`,
        },
        medicines: orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        estimatedDelivery: storeResult.estimatedDelivery,
        prescriptionUrl: prescription?.name,
        customerNotes: orderNotes + ` [Part of multi-store order]`,
        deliveryCharge,
        deliveryMethod: 'delivery',
      });

      orderIds.push(orderId);
    }

    setPlacedOrderIds(orderIds);
    setShowSplitOrderModal(false);
    setShowSuccessModal(true);
    
    toast.success(`${orderIds.length} orders placed successfully across ${splitOrderPlan.length} stores! 🎉`);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedStore) return;

    // Calculate final totals
    let totalAmount = 0;
    const orderItems = selectedStore.availableMedicines.map(item => {
      const qty = orderQuantities[item.medicine.name] || 1;
      const subtotal = item.medicine.price * qty;
      totalAmount += subtotal;
      return {
        name: item.medicine.name,
        quantity: qty,
        price: item.medicine.price,
        subtotal
      };
    });

    const orderId = addOrder({
      pharmacy: {
        name: selectedStore.store.storeName,
        address: selectedStore.store.address,
        phone: selectedStore.store.contactNumber,
        distance: `${selectedStore.store.distanceKm} km`
      },
      medicines: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      deliveryAddress,
      paymentMethod,
      estimatedDelivery: selectedStore.estimatedDelivery,
      prescriptionUrl: prescription?.name,
      customerNotes: orderNotes
    });

    setPlacedOrderId(orderId);
    setShowOrderModal(false);
    setShowSuccessModal(true);

    toast.success("Order placed successfully!");
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
            🔍 Find Medicine
          </motion.h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search for one or multiple medicines across nearby stores
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
                  placeholder="Search for medicines (e.g., Paracetamol, Amoxicillin)..."
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
              Tip: Separate multiple medicines with commas (e.g., "Paracetamol, Cetirizine")
            </p>
            
            {/* Smart Split Order button */}
            {searchedMedicines.length > 1 && storeResults.length > 0 && (
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={handleSmartSplitOrder}
                  variant="outline"
                  className="flex-1 border-2 border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Smart Split Order - Get All Medicines
                </Button>
              </div>
            )}
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
                      <SelectItem value="priority">Best Option</SelectItem>
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
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          prescription={prescription}
          onPrescriptionUpload={handlePrescriptionUpload}
          onPlaceOrder={handlePlaceOrder}
        />

        {/* Multi-Store Split Order Modal */}
        <SplitOrderModal
          show={showSplitOrderModal}
          onClose={() => setShowSplitOrderModal(false)}
          splitOrderPlan={splitOrderPlan}
          quantities={splitOrderQuantities}
          setQuantities={setSplitOrderQuantities}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          prescription={prescription}
          onPrescriptionUpload={handlePrescriptionUpload}
          onPlaceOrders={handlePlaceSplitOrders}
        />

        {/* Success Modal */}
        <SuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderId={placedOrderId}
          orderIds={placedOrderIds}
          onViewOrders={() => navigate("/patient/premium")}
        />
      </motion.div>
    </div>
  );
};

// Store Card Component
interface StoreCardProps {
  result: StoreResult;
  index: number;
  isTopRanked: boolean;
  onOrderNow: (result: StoreResult) => void;
}

const StoreCard = ({ result, index, isTopRanked, onOrderNow }: StoreCardProps) => {
  const { store, availableMedicines, missingMedicines, totalPrice, priorityScore, estimatedDelivery } = result;

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
        {/* Top Ranked Badge */}
        {isTopRanked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
          >
            <Award className="h-4 w-4" />
            Best Option
          </motion.div>
        )}

        {/* Store Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-start gap-2">
            <Package className="h-5 w-5 text-cyan-500 mt-1 flex-shrink-0" />
            <span className="line-clamp-2">{store.storeName}</span>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {store.address}
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
          <div className="space-y-2">
            {availableMedicines.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {item.medicine.name}
                </span>
                <span className="font-bold text-green-700 dark:text-green-400">
                  ₹{item.medicine.price}
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
            <div className="space-y-1">
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
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => onOrderNow(result)}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Order Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Order Modal Component — supports delivery vs pickup and delivery charge calculation
const OrderModal = ({ show, onClose, storeResult, quantities, setQuantities, deliveryAddress, setDeliveryAddress, paymentMethod, setPaymentMethod, orderNotes, setOrderNotes, prescription, onPrescriptionUpload }: any) => {
  const { addOrder } = useOrders();

  if (!show || !storeResult) return null;

  // Local delivery method state
  const [deliveryMethodLocal, setDeliveryMethodLocal] = useState<'delivery' | 'pickup'>('delivery');

  const subtotal = storeResult.availableMedicines.reduce((sum: number, item: any) => {
    return sum + (item.medicine.price * (quantities[item.medicine.name] || 1));
  }, 0);

  // Delivery charge algorithm
  const calculateDeliveryCharge = (distanceKm: number) => {
    if (deliveryMethodLocal === 'pickup') return 0;
    if (distanceKm < 2) return 15;
    return Math.min(distanceKm * 2, 40);
  };

  const deliveryCharge = calculateDeliveryCharge(storeResult.store.distanceKm);
  const totalAmount = subtotal + deliveryCharge;

  const handlePlace = () => {
    // Build order items
    const orderItems = storeResult.availableMedicines.map((item: any) => ({
      name: item.medicine.name,
      quantity: quantities[item.medicine.name] || 1,
      price: item.medicine.price,
    }));

    const orderId = addOrder({
      pharmacy: {
        name: storeResult.store.storeName,
        address: storeResult.store.address,
        phone: storeResult.store.contactNumber,
        distance: `${storeResult.store.distanceKm} km`,
      },
      medicines: orderItems,
      totalAmount,
      deliveryAddress: deliveryMethodLocal === 'delivery' ? deliveryAddress : `Pickup at ${storeResult.store.storeName}`,
      paymentMethod,
      estimatedDelivery: deliveryMethodLocal === 'delivery' ? storeResult.estimatedDelivery : 'Pickup - ready in 15-45 mins',
      prescriptionUrl: prescription?.name,
      customerNotes: orderNotes,
      deliveryCharge,
      deliveryMethod: deliveryMethodLocal,
    });

    onClose();
    toast.success('Order placed successfully!');
    // optionally navigate to orders or show success modal handled by parent
    return orderId;
  };

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
            <p className="text-sm text-slate-600 dark:text-slate-400">{storeResult.store.address}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">📞 {storeResult.store.contactNumber}</p>
          </div>

          {/* Delivery vs Pickup */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border">
            <label className="block font-semibold mb-2">Fulfilment</label>
            <div className="flex gap-3">
              <Button variant={deliveryMethodLocal === 'delivery' ? undefined : 'outline'} onClick={() => setDeliveryMethodLocal('delivery')} className="flex-1">
                <Truck className="mr-2" /> Delivery
              </Button>
              <Button variant={deliveryMethodLocal === 'pickup' ? undefined : 'outline'} onClick={() => setDeliveryMethodLocal('pickup')} className="flex-1">
                <Home className="mr-2" /> Pickup
              </Button>
            </div>
            {deliveryMethodLocal === 'delivery' ? (
              <p className="text-sm text-slate-500 mt-2">Delivery charges apply based on distance. Estimated delivery: {storeResult.estimatedDelivery}</p>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Pickup available. Ready in ~15-45 mins at the store.</p>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-3">Order Items</h4>
            <div className="space-y-3">
              {storeResult.availableMedicines.map((item: any) => (
                <div key={item.medicine.name} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicine.name}</p>
                    <p className="text-sm text-slate-500">₹{item.medicine.price} per unit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantities({
                        ...quantities,
                        [item.medicine.name]: Math.max(1, (quantities[item.medicine.name] || 1) - 1)
                      })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold">{quantities[item.medicine.name] || 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantities({
                        ...quantities,
                        [item.medicine.name]: (quantities[item.medicine.name] || 1) + 1
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="w-20 text-right font-bold text-cyan-600">
                      ₹{item.medicine.price * (quantities[item.medicine.name] || 1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryMethodLocal === 'delivery' && (
            <div>
              <label className="block font-semibold mb-2">Delivery Address</label>
              <Textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="min-h-20"
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block font-semibold mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
                <SelectItem value="card">Card Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prescription Upload */}
          <div>
            <label className="block font-semibold mb-2">Upload Prescription (Optional)</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={onPrescriptionUpload}
                className="hidden"
                id="prescription-upload"
              />
              <label htmlFor="prescription-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {prescription ? prescription.name : "Click to upload prescription (JPG, PNG, PDF)"}
                </p>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <label className="block font-semibold mb-2">Additional Notes (Optional)</label>
            <Textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions for delivery"
            />
          </div>

          {/* Totals */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Subtotal:</span>
              <span className="text-lg font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Delivery Charge:</span>
              <span className="text-lg font-semibold">₹{deliveryCharge}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">₹{totalAmount}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Estimated Delivery: {deliveryMethodLocal === 'delivery' ? storeResult.estimatedDelivery : 'Pickup available at store'}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => { handlePlace(); }} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Place Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Success Modal Component
const SuccessModal = ({ show, onClose, orderId, orderIds, onViewOrders }: any) => {
  const isMultiOrder = orderIds && orderIds.length > 0;
  const displayOrderId = isMultiOrder ? `${orderIds.length} orders` : orderId;
  
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
            {isMultiOrder ? 'Multi-Store Orders Placed!' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-1">
            {isMultiOrder 
              ? `${orderIds.length} orders confirmed across ${orderIds.length} stores`
              : 'Your order has been confirmed'}
          </p>
          {isMultiOrder ? (
            <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-6 max-h-32 overflow-y-auto">
              {orderIds.map((id: string, idx: number) => (
                <p key={id} className="font-mono">Order {idx + 1}: {id}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-mono mb-6">
              Order ID: {orderId}
            </p>
          )}

          <div className="space-y-3">
            <Button
              onClick={onViewOrders}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              View Orders
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

// Multi-Store Split Order Modal Component
const SplitOrderModal = ({ 
  show, 
  onClose, 
  splitOrderPlan, 
  quantities, 
  setQuantities, 
  deliveryAddress, 
  setDeliveryAddress, 
  paymentMethod, 
  setPaymentMethod, 
  orderNotes, 
  setOrderNotes, 
  prescription, 
  onPrescriptionUpload, 
  onPlaceOrders 
}: any) => {
  if (!show || !splitOrderPlan || splitOrderPlan.length === 0) return null;

  // Calculate totals across all stores
  let grandSubtotal = 0;
  let grandDeliveryCharge = 0;

  splitOrderPlan.forEach((storeResult: StoreResult) => {
    const storeQuantities = quantities[storeResult.store.storeId] || {};
    let storeSubtotal = 0;
    
    storeResult.availableMedicines.forEach((item: any) => {
      const qty = storeQuantities[item.medicine.name] || 0;
      if (qty > 0) {
        storeSubtotal += item.medicine.price * qty;
      }
    });
    
    grandSubtotal += storeSubtotal;
    
    const distance = storeResult.store.distanceKm;
    const deliveryCharge = distance < 2 ? 15 : Math.min(distance * 2, 40);
    grandDeliveryCharge += deliveryCharge;
  });

  const grandTotal = grandSubtotal + grandDeliveryCharge;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Smart Split Order - {splitOrderPlan.length} Stores
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your medicines will be ordered from multiple stores to ensure you get everything you need
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store-by-Store Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Order Breakdown by Store
            </h3>
            
            {splitOrderPlan.map((storeResult: StoreResult, storeIdx: number) => {
              const storeQuantities = quantities[storeResult.store.storeId] || {};
              let storeSubtotal = 0;
              
              storeResult.availableMedicines.forEach((item: any) => {
                const qty = storeQuantities[item.medicine.name] || 0;
                if (qty > 0) {
                  storeSubtotal += item.medicine.price * qty;
                }
              });

              const distance = storeResult.store.distanceKm;
              const deliveryCharge = distance < 2 ? 15 : Math.min(distance * 2, 40);
              const storeTotal = storeSubtotal + deliveryCharge;

              return (
                <Card key={storeResult.store.storeId} className="p-4 border-2 border-purple-200 dark:border-purple-800">
                  {/* Store Header */}
                  <div className="mb-4 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Badge className="bg-purple-500">Store {storeIdx + 1}</Badge>
                          {storeResult.store.storeName}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{storeResult.store.address}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">📞 {storeResult.store.contactNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Distance: {storeResult.store.distanceKm} km</p>
                        <p className="text-sm text-slate-500">⭐ {storeResult.store.rating}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items for this store */}
                  <div className="space-y-2 mb-4">
                    {storeResult.availableMedicines.map((item: any) => {
                      if (!storeQuantities[item.medicine.name] || storeQuantities[item.medicine.name] === 0) return null;
                      
                      return (
                        <div key={item.medicine.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.medicine.name}</p>
                            <p className="text-sm text-slate-500">₹{item.medicine.price} per unit</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantities({
                                ...quantities,
                                [storeResult.store.storeId]: {
                                  ...storeQuantities,
                                  [item.medicine.name]: Math.max(1, storeQuantities[item.medicine.name] - 1)
                                }
                              })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center font-bold">{storeQuantities[item.medicine.name]}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantities({
                                ...quantities,
                                [storeResult.store.storeId]: {
                                  ...storeQuantities,
                                  [item.medicine.name]: storeQuantities[item.medicine.name] + 1
                                }
                              })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="w-20 text-right font-bold text-purple-600">
                              ₹{item.medicine.price * storeQuantities[item.medicine.name]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Store totals */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{storeSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Delivery:</span>
                      <span className="font-semibold">₹{deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Store Total:</span>
                      <span className="text-purple-600">₹{storeTotal}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Est. Delivery: {storeResult.estimatedDelivery}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block font-semibold mb-2">Delivery Address (All Orders)</label>
            <Textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              className="min-h-20"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold mb-2">Payment Method (All Orders)</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
                <SelectItem value="card">Card Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prescription Upload */}
          <div>
            <label className="block font-semibold mb-2">Upload Prescription (Optional)</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={onPrescriptionUpload}
                className="hidden"
                id="prescription-upload-split"
              />
              <label htmlFor="prescription-upload-split" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {prescription ? prescription.name : "Click to upload prescription (JPG, PNG, PDF)"}
                </p>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <label className="block font-semibold mb-2">Additional Notes (Optional)</label>
            <Textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions for delivery"
            />
          </div>

          {/* Grand Total */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Total Medicines:</span>
              <span className="text-lg font-semibold">₹{grandSubtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Total Delivery ({splitOrderPlan.length} stores):</span>
              <span className="text-lg font-semibold">₹{grandDeliveryCharge}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xl font-bold">Grand Total:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{grandTotal}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
              {splitOrderPlan.length} separate orders will be created
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={onPlaceOrders} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Place All {splitOrderPlan.length} Orders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindMedicineAdvanced;
