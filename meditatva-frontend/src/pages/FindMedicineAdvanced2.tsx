import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Phone, ShoppingCart, Navigation, 
  TrendingUp, TrendingDown, Package, AlertCircle, 
  Pill, DollarSign, Clock, Store, Upload,
  FileText, Send, MessageCircle, CheckCircle2, Image as ImageIcon, X,
  Plus, Minus, CreditCard, Home, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  searchMedicineAcrossStores,
  getMedicineSuggestions,
  saveContactRequest,
  getMedicinePriceRange,
} from "@/data/medicalStoresData";
import { MedicalStore, MedicineStock } from "@/data/medicineData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";

interface SearchResult {
  medicine: MedicineStock;
  store: MedicalStore;
}

interface ContactModalData {
  store: MedicalStore;
  medicine: MedicineStock;
}

export const FindMedicineAdvanced = memo(() => {
  const navigate = useNavigate();
  const { addOrder, setActiveOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalData, setContactModalData] = useState<ContactModalData | null>(null);
  const [message, setMessage] = useState("");
  const [prescription, setPrescription] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRequestId, setLastRequestId] = useState<string>("");
  
  // Order form state
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("123 Main St, Downtown");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState<string>("");

  // Load last search from localStorage
  useEffect(() => {
    const lastSearch = localStorage.getItem("lastMedicineSearchQuery");
    if (lastSearch) {
      setSearchQuery(lastSearch);
      handleSearch(lastSearch);
    }
  }, []);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    return getMedicineSuggestions(searchQuery);
  }, [searchQuery]);

  // Handle search
  const handleSearch = useCallback((query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const results = searchMedicineAcrossStores(searchTerm);
    setSearchResults(results);
    localStorage.setItem("lastMedicineSearchQuery", searchTerm);
    
    if (results.length > 0) {
      toast.success(`Found ${results.length} results for "${searchTerm}"`);
    } else {
      toast.error(`No results found for "${searchTerm}"`);
    }
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
    localStorage.removeItem("lastMedicineSearchQuery");
  };

  const getDirections = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir//${lat},${lon}`;
    window.open(url, "_blank");
  };

  const handleContactStore = (store: MedicalStore, medicine: MedicineStock) => {
    setContactModalData({ store, medicine });
    setMessage(`Hi, I'm interested in purchasing ${medicine.name}. Is it currently available?`);
    setShowContactModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error("Please upload an image or PDF file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setPrescription(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPrescriptionPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPrescriptionPreview("");
      }

      toast.success("Prescription uploaded successfully");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmitRequest = async () => {
    if (!contactModalData) return;

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (quantity < 1) {
      toast.error("Please select a valid quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save contact request for pharmacy records
      const request = saveContactRequest({
        storeId: contactModalData.store.storeId,
        storeName: contactModalData.store.storeName,
        medicineName: contactModalData.medicine.name,
        message: orderNotes || `Order request for ${quantity} x ${contactModalData.medicine.name}`,
        prescriptionFile: prescription || undefined,
      });

      setLastRequestId(request.id);

      // Calculate total amount
      const totalAmount = contactModalData.medicine.price * quantity;
      
      // Calculate estimated delivery (2 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

      // Create order in OrderContext
      const orderId = addOrder({
        pharmacy: {
          name: contactModalData.store.storeName,
          address: contactModalData.store.address,
          phone: contactModalData.store.contactNumber,
          distance: `${contactModalData.store.distanceKm} km`,
        },
        medicines: [{
          name: contactModalData.medicine.name,
          dosage: contactModalData.medicine.genericName || undefined,
          quantity: quantity,
          price: contactModalData.medicine.price,
        }],
        totalAmount,
        estimatedDelivery: estimatedDelivery.toISOString(),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       paymentMethod === 'upi' ? 'UPI' : 'Card',
        prescriptionUrl: prescriptionPreview || undefined,
        customerNotes: orderNotes || undefined,
      });

      setPlacedOrderId(orderId);
      setActiveOrder(orderId);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setShowContactModal(false);
        setShowSuccessModal(true);
        
        // Reset form
        setMessage("");
        setPrescription(null);
        setPrescriptionPreview("");
        setQuantity(1);
        setOrderNotes("");
      }, 1500);

    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactModalData(null);
    setMessage("");
    setPrescription(null);
    setPrescriptionPreview("");
  };

  // Get price statistics for current search
  const priceStats = useMemo(() => {
    if (searchResults.length === 0 || !searchQuery) return null;
    
    // Get the first medicine name from results
    const firstMedicineName = searchResults[0]?.medicine.name;
    if (!firstMedicineName) return null;

    return getMedicinePriceRange(firstMedicineName);
  }, [searchResults, searchQuery]);

  const inStockCount = searchResults.filter(r => r.medicine.availability === "In Stock").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Pill className="w-12 h-12 text-teal-600 dark:text-teal-400" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 dark:from-teal-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
              Find Medicine
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Search across 6 verified medical stores near Gharuan. Compare prices, check availability, and contact stores directly.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-3xl mx-auto"
        >
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-teal-200 dark:border-teal-900 shadow-xl">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600 dark:text-teal-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search for medicines (e.g., Paracetamol, Aspirin, Insulin...)"
                  className="pl-12 pr-24 h-14 text-lg border-2 border-teal-200 dark:border-teal-800 focus:border-teal-500 dark:focus:border-teal-500 bg-white/50 dark:bg-slate-900/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="h-10 px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSearch()}
                    className="h-10 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border border-teal-200 dark:border-teal-800 rounded-lg shadow-2xl overflow-hidden"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center gap-3 border-b border-teal-100 dark:border-teal-900 last:border-0"
                      >
                        <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-slate-700 dark:text-slate-300">{suggestion}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Price Statistics */}
        {priceStats && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-4 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Lowest Price</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{priceStats.min}</p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-4 border-orange-200 dark:border-orange-900">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Highest Price</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{priceStats.max}</p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-4 border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Price</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{priceStats.avg.toFixed(0)}</p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-4 border-teal-200 dark:border-teal-900">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{inStockCount}/{searchResults.length}</p>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {searchResults.length} Results Found
              </h2>
            </div>

            {/* Medicine Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result, index) => (
                <MedicineCard
                  key={`${result.store.storeId}-${result.medicine.name}-${index}`}
                  result={result}
                  index={index}
                  onContact={handleContactStore}
                  onDirections={getDirections}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {searchQuery && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No results found for "{searchQuery}"
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try searching for different medicine names or check the spelling
            </p>
          </motion.div>
        )}

        {/* Initial State */}
        {!searchQuery && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-8"
          >
            <div className="space-y-4">
              <Package className="w-20 h-20 text-teal-400 dark:text-teal-600 mx-auto" />
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
                Search for Any Medicine
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Find availability, compare prices, and contact stores directly from 6 verified medical stores
              </p>
            </div>

            {/* Popular Medicines */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Popular Searches:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {["Paracetamol", "Aspirin", "Cetirizine", "Omeprazole", "Metformin", "Insulin"].map((med) => (
                  <Button
                    key={med}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(med);
                      handleSearch(med);
                    }}
                    className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600"
                  >
                    {med}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contact Store Modal */}
      <AnimatePresence>
        {showContactModal && contactModalData && (
          <ContactStoreModal
            store={contactModalData.store}
            medicine={contactModalData.medicine}
            message={message}
            setMessage={setMessage}
            prescription={prescription}
            prescriptionPreview={prescriptionPreview}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onSubmit={handleSubmitRequest}
            onClose={closeContactModal}
            isSubmitting={isSubmitting}
            quantity={quantity}
            setQuantity={setQuantity}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <SuccessModal
            requestId={lastRequestId}
            orderId={placedOrderId}
            onClose={() => setShowSuccessModal(false)}
            onViewOrders={() => {
              setShowSuccessModal(false);
              navigate("/patient/modern?section=orders");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

FindMedicineAdvanced.displayName = "FindMedicineAdvanced";

// Medicine Card Component
interface MedicineCardProps {
  result: SearchResult;
  index: number;
  onContact: (store: MedicalStore, medicine: MedicineStock) => void;
  onDirections: (lat: number, lon: number) => void;
}

const MedicineCard = memo(({ result, index, onContact, onDirections }: MedicineCardProps) => {
  const { medicine, store } = result;
  
  const availabilityConfig = {
    "In Stock": { icon: "🟢", color: "green", bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-400" },
    "Low Stock": { icon: "🟡", color: "orange", bgColor: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-400" },
    "Out of Stock": { icon: "🔴", color: "red", bgColor: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-700 dark:text-red-400" },
  };

  const config = availabilityConfig[medicine.availability];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border-teal-200 dark:border-teal-900 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 overflow-hidden group h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-blue-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:via-blue-500/5 group-hover:to-teal-500/5 transition-all duration-500" />
        
        <div className="relative p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                  {medicine.name}
                </h3>
                {medicine.genericName && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                    {medicine.genericName}
                  </p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full ${config.bgColor} flex items-center gap-1.5 shrink-0`}>
                <span className="text-base">{config.icon}</span>
                <span className={`text-xs font-medium ${config.textColor}`}>
                  {medicine.availability}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300">
                {medicine.category}
              </Badge>
              {medicine.stockQuantity > 0 && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {medicine.stockQuantity} units
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
              ₹{medicine.price}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">per unit</span>
          </div>

          {/* Store Info */}
          <div className="space-y-2 pt-3 border-t border-teal-100 dark:border-teal-900">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                {store.storeName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                {store.distanceKm} km • {store.address}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {store.openTime} - {store.closeTime}
              </span>
            </div>

            {store.rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  ⭐ {store.rating}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDirections(store.lat, store.lon)}
              className="gap-2 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Directions</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onContact(store, medicine)}
              disabled={medicine.availability === "Out of Stock"}
              className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </Button>
          </div>

          {medicine.manufacturer && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Manufactured by {medicine.manufacturer}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

MedicineCard.displayName = "MedicineCard";

// Contact Store Modal Component
interface ContactStoreModalProps {
  store: MedicalStore;
  medicine: MedicineStock;
  message: string;
  setMessage: (message: string) => void;
  prescription: File | null;
  prescriptionPreview: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  quantity: number;
  setQuantity: (qty: number) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
}

const ContactStoreModal = memo(({
  store,
  medicine,
  message,
  setMessage,
  prescription,
  prescriptionPreview,
  onFileChange,
  onDrop,
  onDragOver,
  onSubmit,
  onClose,
  isSubmitting,
  quantity,
  setQuantity,
  deliveryAddress,
  setDeliveryAddress,
  paymentMethod,
  setPaymentMethod,
  orderNotes,
  setOrderNotes,
}: ContactStoreModalProps) => {
  const totalAmount = medicine.price * quantity;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-200 dark:border-teal-800"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 p-6 border-b border-teal-700">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h2 className="text-2xl font-bold text-white">Place Order</h2>
              <p className="text-teal-100">{store.storeName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Medicine Info */}
          <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                <Pill className="w-5 h-5" />
                <span className="font-semibold">Medicine Details</span>
              </div>
              <div className="pl-7 space-y-1">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{medicine.name}</p>
                {medicine.genericName && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{medicine.genericName}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-teal-700 dark:text-teal-300">₹{medicine.price}</span>
                  <span className="text-slate-600 dark:text-slate-400">{medicine.category}</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{medicine.availability}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Store Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                <p className="font-medium text-slate-900 dark:text-white">{store.address} • {store.distanceKm} km</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Contact</p>
                <p className="font-medium text-slate-900 dark:text-white">{store.contactNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Operating Hours</p>
                <p className="font-medium text-slate-900 dark:text-white">{store.openTime} - {store.closeTime}</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-4 border-2 border-teal-200 dark:border-teal-800 rounded-xl p-4 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/10 dark:to-blue-900/10">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Order Details
            </h3>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 border-teal-300 dark:border-teal-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center font-semibold text-lg w-20 border-teal-300 dark:border-teal-700"
                  min="1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 border-teal-300 dark:border-teal-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="ml-auto text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹{totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Delivery Address
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address..."
                className="border-teal-300 dark:border-teal-700 focus:border-teal-500"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="border-teal-300 dark:border-teal-700">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">💵 Cash on Delivery</SelectItem>
                  <SelectItem value="upi">📱 UPI</SelectItem>
                  <SelectItem value="card">💳 Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Delivery */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Estimated Delivery</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    2 days from order confirmation
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions for the pharmacy..."
              className="min-h-[80px] border-teal-200 dark:border-teal-800 focus:border-teal-500 dark:focus:border-teal-500"
            />
          </div>

          {/* Prescription Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Upload Prescription (Optional)
            </label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-lg p-6 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors cursor-pointer bg-teal-50/50 dark:bg-teal-900/10"
            >
              <input
                type="file"
                id="prescription-upload"
                accept="image/*,application/pdf"
                onChange={onFileChange}
                className="hidden"
              />
              
              {prescription ? (
                <div className="space-y-3">
                  {prescriptionPreview ? (
                    <img
                      src={prescriptionPreview}
                      alt="Prescription preview"
                      className="max-h-40 mx-auto rounded-lg border border-teal-200 dark:border-teal-800"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-teal-600 dark:text-teal-400 mx-auto" />
                  )}
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{prescription.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {(prescription.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("prescription-upload")?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Drop your prescription here
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      or click to browse (Image or PDF, max 5MB)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("prescription-upload")?.click()}
                    className="gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !deliveryAddress.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 gap-2 text-lg py-6"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.div>
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Place Order • ₹{totalAmount}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

ContactStoreModal.displayName = "ContactStoreModal";

// Success Modal Component
interface SuccessModalProps {
  requestId: string;
  orderId: string;
  onClose: () => void;
  onViewOrders: () => void;
}

const SuccessModal = memo(({ requestId, orderId, onClose, onViewOrders }: SuccessModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-2 border-green-200 dark:border-green-800"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Order Placed Successfully! 🎉
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your medicine order has been confirmed. The pharmacy will process it and deliver within 2 days.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Order ID</p>
            <p className="font-mono text-lg font-bold text-teal-700 dark:text-teal-300">
              {orderId}
            </p>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start gap-3 text-left">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Estimated Delivery
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  2 days from pharmacy confirmation
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onViewOrders}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 gap-2 text-lg py-6"
          >
            <Package className="w-5 h-5" />
            View My Orders
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 The store typically responds within 2-3 seconds
        </p>
      </motion.div>
    </motion.div>
  );
});

SuccessModal.displayName = "SuccessModal";
