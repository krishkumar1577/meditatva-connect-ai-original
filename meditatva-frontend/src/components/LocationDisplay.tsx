import { motion, AnimatePresence } from "framer-motion";
import { MapPin, RefreshCw, AlertCircle, Loader2, Navigation } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect } from "react";

interface LocationDisplayProps {
  variant?: "patient" | "pharmacy";
  showFullAddress?: boolean;
  onLocationUpdate?: (location: any) => void;
}

export const LocationDisplay = ({ 
  variant = "patient", 
  showFullAddress = false,
  onLocationUpdate 
}: LocationDisplayProps) => {
  const { location, loading, error, permissionDenied, refreshLocation } = useGeolocation();

  useEffect(() => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [location, onLocationUpdate]);

  const handleRefresh = () => {
    refreshLocation();
    toast.info("Updating your location...");
  };

  // Styles based on variant
  const isPharmacy = variant === "pharmacy";
  const bgColor = isPharmacy 
    ? "bg-white/10 backdrop-blur-md border-white/20" 
    : "bg-white/90 backdrop-blur-md border-cyan-500/20";
  const textColor = isPharmacy ? "text-white" : "text-[#0A2342]";
  const iconColor = isPharmacy ? "text-white" : "text-cyan-600";
  const badgeStyle = isPharmacy
    ? "bg-white/20 text-white border-white/30"
    : "bg-cyan-500/10 text-cyan-700 border-cyan-500/30";

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}
      >
        <Loader2 className={`h-4 w-4 animate-spin ${iconColor}`} />
        <span className={`text-sm font-medium ${textColor}`}>
          Detecting location...
        </span>
      </motion.div>
    );
  }

  if (error || permissionDenied) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
          isPharmacy 
            ? "bg-red-500/10 border-red-400/30" 
            : "bg-red-50 border-red-300"
        }`}
      >
        <AlertCircle className={`h-4 w-4 ${isPharmacy ? "text-red-300" : "text-red-600"}`} />
        <div className="flex-1">
          <p className={`text-xs font-medium ${isPharmacy ? "text-red-200" : "text-red-700"}`}>
            {permissionDenied ? "Location Access Denied" : "Location Error"}
          </p>
          <p className={`text-xs ${isPharmacy ? "text-red-300/80" : "text-red-600/80"}`}>
            {error}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          className={`h-7 px-2 ${
            isPharmacy 
              ? "hover:bg-white/10 text-red-200" 
              : "hover:bg-red-100 text-red-700"
          }`}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </motion.div>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="location-display"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor} shadow-lg`}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <MapPin className={`h-4 w-4 ${iconColor}`} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge className={`${badgeStyle} h-5 text-xs font-semibold px-2`}>
              <Navigation className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className={`text-xs font-medium ${textColor} truncate mt-0.5`}>
            {showFullAddress 
              ? location.formattedAddress 
              : location.city && location.state
                ? `${location.city}, ${location.state}${location.postalCode ? ` ${location.postalCode}` : ''}`
                : location.city && location.country
                ? `${location.city}, ${location.country}`
                : location.formattedAddress || "Your Location"
            }
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className={`h-7 w-7 p-0 ${
              isPharmacy 
                ? "hover:bg-white/20 text-white/80" 
                : "hover:bg-cyan-100 text-cyan-700"
            }`}
            title="Refresh location"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
