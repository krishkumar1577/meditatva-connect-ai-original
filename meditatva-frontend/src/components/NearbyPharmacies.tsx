import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, Phone, Clock, ExternalLink, X, Loader2, AlertCircle, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Pharmacy {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  business_status?: string;
}

interface NearbyPharmaciesProps {
  variant?: "patient" | "pharmacy";
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "your_google_places_api_key_here";

export const NearbyPharmacies = ({ variant = "patient" }: NearbyPharmaciesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPharmacy = variant === "pharmacy";

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const findNearbyPharmacies = async () => {
    setLoading(true);
    setError(null);
    setPharmacies([]);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported on your browser.");
      setLoading(false);
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        console.log("=== Finding Nearby Pharmacies ===");
        console.log(`User Location: ${latitude}, ${longitude}`);

        try {
          // Note: Direct browser calls to Google Places API will fail due to CORS
          // We need to use a proxy or make this call from backend
          // For now, using a CORS proxy for demo purposes
          const proxyUrl = "https://api.allorigins.win/raw?url=";
          const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=pharmacy&key=${GOOGLE_PLACES_API_KEY}`;
          
          const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          console.log("=== Google Places API Response ===");
          console.log("Status:", data.status);
          console.log("Results:", data.results?.length || 0);

          if (data.status === "OK" && data.results && data.results.length > 0) {
            // Sort by distance
            const sortedResults = data.results
              .map((pharmacy: Pharmacy) => ({
                ...pharmacy,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  pharmacy.geometry.location.lat,
                  pharmacy.geometry.location.lng
                )
              }))
              .sort((a: any, b: any) => {
                const distA = parseFloat(a.distance);
                const distB = parseFloat(b.distance);
                return distA - distB;
              });

            setPharmacies(sortedResults);
            setIsOpen(true);
            toast.success(`Found ${sortedResults.length} nearby pharmacies!`);
          } else if (data.status === "ZERO_RESULTS") {
            setError("No nearby pharmacies found within 5 km radius.");
            toast.info("No pharmacies found nearby");
          } else if (data.status === "REQUEST_DENIED") {
            setError("API request denied. Please check API key configuration.");
            toast.error("API access denied");
          } else {
            setError(`Unable to fetch pharmacies: ${data.status}`);
            toast.error("Failed to fetch pharmacies");
          }
        } catch (err) {
          console.error("Error fetching pharmacies:", err);
          setError("Failed to fetch nearby pharmacies. Please try again.");
          toast.error("Network error occurred");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        let errorMessage = "Unable to get your location.";
        
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "Please enable location access to find nearby stores.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "Location request timed out.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const openInGoogleMaps = (pharmacy: Pharmacy) => {
    const { lat, lng } = pharmacy.geometry.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${pharmacy.place_id}`;
    window.open(url, "_blank");
  };

  const getDirections = (pharmacy: Pharmacy) => {
    if (!userLocation) return;
    const { lat, lng } = pharmacy.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Search Button */}
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          onClick={findNearbyPharmacies}
          disabled={loading}
          className={`gap-2 ${
            isPharmacy
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Navigation2 className="h-4 w-4" />
              <span className="hidden sm:inline">Search Medical Stores Near Me</span>
              <span className="sm:hidden">Near Me</span>
            </>
          )}
        </Button>
      </motion.div>

      {/* Results Modal */}
      <AnimatePresence>
        {(isOpen || error) && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <Card
                className="overflow-hidden"
                style={{
                  background: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(20, 184, 166, 0.3)",
                }}
              >
                {/* Header */}
                <div
                  className="p-4 sm:p-6 flex justify-between items-center relative border-b border-white/10"
                  style={{
                    background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)",
                  }}
                >
                  <div>
                    <h3 className="text-white font-bold text-xl sm:text-2xl flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-cyan-400" />
                      Nearby Medical Stores
                    </h3>
                    {pharmacies.length > 0 && (
                      <p className="text-sm text-white/70 mt-1">
                        Found {pharmacies.length} pharmacies within 5 km
                      </p>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        setError(null);
                      }}
                      className="text-white hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                      <p className="text-white text-lg mb-2">Oops!</p>
                      <p className="text-gray-400">{error}</p>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                        <Button
                          onClick={() => {
                            setError(null);
                            findNearbyPharmacies();
                          }}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        >
                          Try Again
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : pharmacies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pharmacies.map((pharmacy, index) => (
                        <motion.div
                          key={pharmacy.place_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="p-4 hover:border-cyan-500/50 transition-all cursor-pointer"
                            style={{
                              background: "rgba(31, 41, 55, 0.6)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-base mb-1 line-clamp-1">
                                  {pharmacy.name}
                                </h4>
                                <p className="text-gray-400 text-sm line-clamp-2 flex items-start gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{pharmacy.vicinity}</span>
                                </p>
                              </div>
                              <Badge
                                className="ml-2 flex-shrink-0"
                                style={{
                                  background: "rgba(20, 184, 166, 0.2)",
                                  border: "1px solid rgba(20, 184, 166, 0.3)",
                                  color: "#14B8A6",
                                }}
                              >
                                {(pharmacy as any).distance}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 mb-3 text-sm">
                              {pharmacy.rating && (
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-4 w-4 fill-yellow-400" />
                                  <span className="text-white font-medium">{pharmacy.rating}</span>
                                  {pharmacy.user_ratings_total && (
                                    <span className="text-gray-400">({pharmacy.user_ratings_total})</span>
                                  )}
                                </div>
                              )}
                              {pharmacy.opening_hours?.open_now !== undefined && (
                                <Badge
                                  className={
                                    pharmacy.opening_hours.open_now
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : "bg-red-500/20 text-red-400 border-red-500/30"
                                  }
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {pharmacy.opening_hours.open_now ? "Open Now" : "Closed"}
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                                <Button
                                  size="sm"
                                  onClick={() => getDirections(pharmacy)}
                                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                                >
                                  <Navigation className="h-4 w-4 mr-2" />
                                  Directions
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openInGoogleMaps(pharmacy)}
                                  className="border-white/10 hover:bg-white/5 text-gray-300"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="h-16 w-16 mx-auto mb-4 text-cyan-400 animate-spin" />
                      <p className="text-white text-lg">Searching for nearby pharmacies...</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
