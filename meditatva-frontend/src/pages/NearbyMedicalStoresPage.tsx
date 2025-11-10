import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Loader2, RefreshCw, Search, AlertCircle, Phone, ExternalLink, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GoogleMapComponent } from "@/components/GoogleMapComponent";

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
}

interface MedicalStore {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lon: number;
  phone?: string;
  type?: string;
}

export const NearbyMedicalStoresPage = memo(() => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [stores, setStores] = useState<MedicalStore[]>([]);
  const [filteredStores, setFilteredStores] = useState<MedicalStore[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRadius, setSearchRadius] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [manualLocationSearch, setManualLocationSearch] = useState("");
  const [searchingManualLocation, setSearchingManualLocation] = useState(false);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "your_google_maps_api_key_here";

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setPermissionDenied(false);

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    try {
      // First, try to get the position with high accuracy
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: true,
            timeout: 20000, // Increased timeout to 20 seconds
            maximumAge: 0, // Don't use cached position
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      console.log("📍 Location obtained:", { latitude, longitude, accuracy });

      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use Nominatim for reverse geocoding with proper headers
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "MediTatva/1.0", // Add user agent as required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("🌍 Reverse geocoding data:", data);
      
      const addr = data.address || {};

      // More comprehensive address parsing
      const city = addr.city || 
                   addr.town || 
                   addr.village || 
                   addr.municipality || 
                   addr.suburb ||
                   addr.county || 
                   addr.state_district ||
                   "Unknown City";
      
      const state = addr.state || addr.province || addr.region || "";
      const country = addr.country || "India"; // Default to India for this app
      const postalCode = addr.postcode || "";

      const locationData = {
        latitude,
        longitude,
        city,
        state,
        country,
        postalCode,
        formattedAddress: data.display_name || `${city}, ${state}` || `${latitude}, ${longitude}`,
      };

      console.log("✅ Location data set:", locationData);
      
      setUserLocation(locationData);
      setLocationLoading(false);
      
      toast.success(`Location detected: ${city}${state ? ', ' + state : ''}`);
    } catch (error: any) {
      console.error("❌ Location error:", error);
      
      if (error.code === 1 || error.message?.includes("denied")) {
        setPermissionDenied(true);
        toast.error("Location access denied. Please enable location permissions in your browser settings.");
      } else if (error.code === 2) {
        toast.error("Location unavailable. Please check your device's location services.");
      } else if (error.code === 3 || error.message?.includes("timeout")) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to get location. Please try again or enter manually.");
      }
      
      setLocationLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const searchNearbyStores = async () => {
    if (!userLocation) {
      toast.error("Please enable location access first");
      return;
    }

    setLoading(true);
    const { latitude, longitude } = userLocation;
    const radiusInMeters = searchRadius;

    try {
      const overpassQuery = `
        [out:json][timeout:30];
        (
          node[amenity=pharmacy](around:${radiusInMeters},${latitude},${longitude});
          node[shop=chemist](around:${radiusInMeters},${latitude},${longitude});
          node[healthcare=pharmacy](around:${radiusInMeters},${latitude},${longitude});
          node[amenity=clinic](around:${radiusInMeters},${latitude},${longitude});
          node[amenity=hospital](around:${radiusInMeters},${latitude},${longitude});
          node[amenity=doctors](around:${radiusInMeters},${latitude},${longitude});
          node[dispensing=yes](around:${radiusInMeters},${latitude},${longitude});
          node[shop=medical](around:${radiusInMeters},${latitude},${longitude});
          node[shop=drugstore](around:${radiusInMeters},${latitude},${longitude});
        );
        out body;
      `;

      const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });

      const overpassData = await overpassResponse.json();
      let allStores: MedicalStore[] = [];

      if (overpassData.elements && overpassData.elements.length > 0) {
        allStores = overpassData.elements.map((element: any) => {
          const distance = calculateDistance(latitude, longitude, element.lat, element.lon);
          return {
            id: element.id.toString(),
            name: element.tags?.name || element.tags?.operator || "Medical Store",
            address: element.tags?.["addr:full"] || element.tags?.["addr:street"] || "Address not available",
            lat: element.lat,
            lon: element.lon,
            distance: parseFloat(distance.toFixed(2)),
            phone: element.tags?.phone || element.tags?.["contact:phone"],
            type: element.tags?.amenity || element.tags?.shop || "pharmacy",
          };
        });
      }

      if (allStores.length < 5) {
        const searchTerms = ["pharmacy", "chemist", "drugstore", "medical store", "apothecary"];
        
        for (const term of searchTerms) {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${term}&viewbox=${
            longitude - 0.2
          },${latitude + 0.2},${longitude + 0.2},${latitude - 0.2}&bounded=1&limit=50`;

          const nominatimResponse = await fetch(nominatimUrl);
          const nominatimData = await nominatimResponse.json();

          const nominatimStores = nominatimData.map((place: any) => {
            const distance = calculateDistance(latitude, longitude, parseFloat(place.lat), parseFloat(place.lon));
            return {
              id: place.place_id.toString(),
              name: place.display_name.split(",")[0],
              address: place.display_name,
              lat: parseFloat(place.lat),
              lon: parseFloat(place.lon),
              distance: parseFloat(distance.toFixed(2)),
              type: "pharmacy",
            };
          }).filter((store: MedicalStore) => store.distance <= searchRadius / 1000);

          allStores = [...allStores, ...nominatimStores];
        }
      }

      const uniqueStores = allStores.filter(
        (store, index, self) =>
          index ===
          self.findIndex(
            (s) =>
              Math.abs(s.lat - store.lat) < 0.0001 && Math.abs(s.lon - store.lon) < 0.0001
          )
      );

      const sortedStores = uniqueStores
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 100);

      setStores(sortedStores);
      setFilteredStores(sortedStores);

      if (sortedStores.length === 0) {
        toast.info(`No medical stores found within ${searchRadius / 1000}km`);
      } else {
        toast.success(`Found ${sortedStores.length} medical stores nearby`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDirections = (lat: number, lon: number) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${lat},${lon}`;
      window.open(url, "_blank");
    }
  };

  const searchLocationManually = async () => {
    if (!manualLocationSearch.trim()) {
      toast.error("Please enter a location (city, area, or PIN code)");
      return;
    }

    setSearchingManualLocation(true);
    
    try {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use Nominatim to search for the location
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocationSearch)}&countrycodes=in&addressdetails=1&limit=1`;
      
      const response = await fetch(searchUrl, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "MediTatva/1.0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to search location");
      }

      const results = await response.json();
      
      if (results.length === 0) {
        toast.error("Location not found. Please try with a different search term.");
        setSearchingManualLocation(false);
        return;
      }

      const result = results[0];
      const addr = result.address || {};
      
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      
      const city = addr.city || 
                   addr.town || 
                   addr.village || 
                   addr.municipality || 
                   addr.suburb ||
                   addr.county || 
                   addr.state_district ||
                   result.name ||
                   "Unknown City";
      
      const state = addr.state || addr.province || addr.region || "";
      const country = addr.country || "India";
      const postalCode = addr.postcode || "";

      const locationData = {
        latitude,
        longitude,
        city,
        state,
        country,
        postalCode,
        formattedAddress: result.display_name || `${city}, ${state}`,
      };

      console.log("✅ Manual location set:", locationData);
      
      setUserLocation(locationData);
      setSearchingManualLocation(false);
      setPermissionDenied(false); // Clear permission denied state
      
      toast.success(`Location set to: ${city}${state ? ', ' + state : ''}`);
      
      // Auto-search for stores after setting location
      setTimeout(() => {
        searchNearbyStores();
      }, 500);
      
    } catch (error) {
      console.error("Manual location search error:", error);
      toast.error("Failed to find location. Please try again.");
      setSearchingManualLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation && stores.length === 0 && !loading) {
      searchNearbyStores();
    }
  }, [userLocation]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStores(filtered);
    }
  }, [searchQuery, stores]);

  const radiusOptions = [
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 15000, label: "15 km" },
    { value: 20000, label: "20 km" },
    { value: 25000, label: "25 km" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Premium Header Card */}
      <Card 
        className="p-8 bg-white border-2 shadow-2xl relative overflow-hidden"
        style={{
          borderColor: 'rgba(79, 195, 247, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 244, 248, 0.5) 100%)',
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4FC3F7]/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#1B6CA8]/10 to-transparent rounded-full translate-y-24 -translate-x-24" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3 flex-1">
              {/* Title with Live Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] p-3 rounded-xl shadow-lg">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2342] to-[#1B6CA8] bg-clip-text text-transparent">
                  Find Nearby Medical Stores
                </h1>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Badge 
                    className="px-3 py-1 text-sm font-bold shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <span className="relative flex h-2.5 w-2.5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    Live
                  </Badge>
                </motion.div>
              </div>

              {/* Location Display */}
              {locationLoading ? (
                <div className="flex items-center gap-3 p-4 bg-[#E8F4F8] rounded-xl border border-[#4FC3F7]/30">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1B6CA8]" />
                  <span className="text-[#5A6A85] font-medium">Detecting your location...</span>
                </div>
              ) : permissionDenied ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-[#FFF3CD] rounded-xl border border-[#F39C12]/30">
                    <AlertCircle className="h-5 w-5 text-[#F39C12]" />
                    <span className="text-[#0A2342] font-medium">Location access denied. Enter your location manually below.</span>
                  </div>
                  
                  {/* Manual Location Search */}
                  <div className="flex gap-2 p-4 bg-white rounded-xl border-2 border-[#4FC3F7]/30">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B6CA8]" />
                      <Input
                        type="text"
                        placeholder="Enter city, area, or PIN code (e.g., Mumbai, 400001)"
                        value={manualLocationSearch}
                        onChange={(e) => setManualLocationSearch(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && searchLocationManually()}
                        className="pl-10 border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                      />
                    </div>
                    <Button
                      onClick={searchLocationManually}
                      disabled={searchingManualLocation || !manualLocationSearch.trim()}
                      className="bg-[#1B6CA8] hover:bg-[#4FC3F7] text-white"
                    >
                      {searchingManualLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : userLocation ? (
                <div className="space-y-2 p-4 bg-gradient-to-r from-[#E8F4F8] to-[#F7F9FC] rounded-xl border border-[#4FC3F7]/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#2ECC71] shadow-lg shadow-[#2ECC71]/50" />
                    <p className="text-sm font-semibold text-[#5A6A85] uppercase tracking-wide">Your Current Location</p>
                  </div>
                  <p className="text-xl font-bold text-[#0A2342]">
                    {userLocation.city !== "Unknown City"
                      ? `${userLocation.city}, ${userLocation.state}`
                      : userLocation.formattedAddress}
                  </p>
                  {userLocation.postalCode && (
                    <p className="text-sm text-[#1B6CA8] font-semibold">📍 PIN: {userLocation.postalCode}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#4FC3F7]/20">
                  <p className="text-[#5A6A85] font-medium">Enable location to find nearby stores</p>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                size="lg"
                className="gap-2 shadow-xl"
                style={{
                  background: locationLoading 
                    ? 'linear-gradient(135deg, #E8F4F8 0%, #F7F9FC 100%)'
                    : 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
                  color: locationLoading ? '#5A6A85' : 'white',
                  border: '2px solid rgba(79, 195, 247, 0.3)',
                }}
              >
                {locationLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                Refresh Location
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-[#4FC3F7]/20 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#0A2342] mb-2">
                Search Radius
              </label>
              <div className="flex gap-2 flex-wrap">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setSearchRadius(option.value)}
                    variant={searchRadius === option.value ? "default" : "outline"}
                    size="sm"
                    className={searchRadius === option.value 
                      ? "min-w-[70px] bg-[#1B6CA8] hover:bg-[#4FC3F7] text-white" 
                      : "min-w-[70px] border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]"}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={searchNearbyStores}
                disabled={!userLocation || loading}
                className="gap-2 bg-[#1B6CA8] hover:bg-[#4FC3F7] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find Stores
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6A85]" />
            <Input
              type="text"
              placeholder="Search by store name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
            />
          </div>
        </div>
      </Card>

      {/* Google Maps Integration */}
      {userLocation && filteredStores.length > 0 && (
        <Card className="p-6 bg-white border-[#4FC3F7]/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2342] flex items-center gap-2">
              <Map className="h-5 w-5 text-[#1B6CA8]" />
              Live Map View
            </h2>
            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              size="sm"
              className="border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]"
            >
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
          {showMap && (
            <GoogleMapComponent
              userLocation={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              stores={filteredStores}
              apiKey={GOOGLE_MAPS_API_KEY}
            />
          )}
        </Card>
      )}

      {filteredStores.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-[#5A6A85]">
            Showing {filteredStores.length} of {stores.length} stores
          </p>
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="ghost"
              size="sm"
              className="text-[#1B6CA8] hover:text-[#4FC3F7] hover:bg-[#E8F4F8]"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5 hover:shadow-xl transition-all duration-300 bg-white border-2 border-[#4FC3F7]/20 hover:border-[#4FC3F7]/60">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0A2342] line-clamp-2">
                        {store.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1 text-xs bg-[#E8F4F8] text-[#1B6CA8] border-[#4FC3F7]/30">
                        {store.type || "pharmacy"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#1B6CA8]">
                        {store.distance}
                      </p>
                      <p className="text-xs text-[#5A6A85]">km away</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-[#5A6A85]">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#1B6CA8]" />
                    <p className="line-clamp-2">{store.address}</p>
                  </div>

                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#5A6A85]">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#1B6CA8]" />
                      <a
                        href={`tel:${store.phone}`}
                        className="hover:text-[#4FC3F7] transition-colors"
                      >
                        {store.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => getDirections(store.lat, store.lon)}
                      className="flex-1 gap-2 bg-[#1B6CA8] hover:bg-[#4FC3F7] text-white"
                      size="sm"
                    >
                      <Navigation className="h-4 w-4" />
                      Directions
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lon}`,
                          "_blank"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="gap-2 border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredStores.length === 0 && stores.length === 0 && userLocation && (
        <Card className="p-12 text-center bg-white border-[#4FC3F7]/20 shadow-lg">
          <MapPin className="h-16 w-16 text-[#4FC3F7] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0A2342] mb-2">
            No stores found
          </h3>
          <p className="text-[#5A6A85] mb-6">
            Click "Find Stores" to search for medical stores near you
          </p>
          <Button onClick={searchNearbyStores} className="gap-2 bg-[#1B6CA8] hover:bg-[#4FC3F7] text-white">
            <Search className="h-4 w-4" />
            Search Now
          </Button>
        </Card>
      )}

      {!loading && filteredStores.length === 0 && stores.length > 0 && (
        <Card className="p-12 text-center bg-white border-[#4FC3F7]/20 shadow-lg">
          <AlertCircle className="h-16 w-16 text-[#F39C12] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0A2342] mb-2">
            No matching stores
          </h3>
          <p className="text-[#5A6A85] mb-6">
            Try different search terms or clear the search filter
          </p>
          <Button onClick={() => setSearchQuery("")} variant="outline" className="border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]">
            Clear Search
          </Button>
        </Card>
      )}
    </div>
  );
});

NearbyMedicalStoresPage.displayName = "NearbyMedicalStoresPage";
