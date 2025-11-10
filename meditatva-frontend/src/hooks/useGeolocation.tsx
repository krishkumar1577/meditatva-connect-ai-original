import { useState, useEffect } from "react";

const GOOGLE_GEOCODING_API_KEY = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY || "your_google_geocoding_api_key_here";

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
}

export interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const getAddressFromCoords = async (lat: number, lng: number, retries = 3): Promise<LocationData> => {
    // Try Nominatim (OpenStreetMap) as free alternative first
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Try OpenStreetMap Nominatim (free, no API key needed)
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'MediTatva-Location-Service'
          }
        });
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          console.log("Nominatim API response:", nominatimData);

          if (nominatimData.address) {
            const addr = nominatimData.address;
            const city = addr.city || addr.town || addr.village || addr.municipality || 
                        addr.county || addr.state_district || "";
            const state = addr.state || addr.province || "";
            const country = addr.country || "";
            const postalCode = addr.postcode || "";

            const addressParts = [];
            if (city) addressParts.push(city);
            if (state) addressParts.push(state);
            if (country && !state) addressParts.push(country);
            if (postalCode) addressParts.push(postalCode);

            const formattedAddress = addressParts.join(", ") || nominatimData.display_name.split(',').slice(0, 3).join(',');

            return {
              latitude: lat,
              longitude: lng,
              address: nominatimData.display_name,
              city: city || state || country || "Your Location",
              state,
              country,
              postalCode,
              formattedAddress: formattedAddress || "Your Current Location",
            };
          }
        }

        // Fallback to Google Geocoding if Nominatim fails
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_GEOCODING_API_KEY}`;
        const response = await fetch(googleUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        console.log("Google Geocoding API response:", data);
        console.log("Status:", data.status);
        console.log("Results count:", data.results?.length);
        if (data.results?.[0]) {
          console.log("Formatted Address:", data.results[0].formatted_address);
          console.log("Address Components:", data.results[0].address_components);
        }

        if (data.status === "OK" && data.results.length > 0) {
          const result = data.results[0];
          const addressComponents = result.address_components;

          // Extract address components
          const getComponent = (type: string) => {
            const component = addressComponents.find((comp: any) => 
              comp.types.includes(type)
            );
            return component?.long_name || "";
          };

          const getComponentShort = (type: string) => {
            const component = addressComponents.find((comp: any) => 
              comp.types.includes(type)
            );
            return component?.short_name || "";
          };

          // Try multiple strategies to get city
          const city = getComponent("locality") || 
                       getComponent("administrative_area_level_2") ||
                       getComponent("sublocality") ||
                       getComponent("sublocality_level_1") ||
                       getComponent("postal_town") ||
                       "";
          
          const state = getComponentShort("administrative_area_level_1") || 
                        getComponent("administrative_area_level_1") || 
                        "";
          const country = getComponent("country") || "";
          const postalCode = getComponent("postal_code") || "";

          console.log("=== Extracted Components ===");
          console.log("City:", city);
          console.log("State:", state);
          console.log("Country:", country);
          console.log("Postal Code:", postalCode);

          // Build formatted address from components
          let formattedAddress = "";
          
          if (city && state) {
            formattedAddress = postalCode 
              ? `${city}, ${state} ${postalCode}` 
              : `${city}, ${state}`;
          } else if (city && country) {
            formattedAddress = `${city}, ${country}`;
          } else if (state && country) {
            formattedAddress = `${state}, ${country}`;
          } else if (city) {
            formattedAddress = city;
          } else if (country) {
            formattedAddress = country;
          } else {
            // Parse from Google's formatted address
            const addressParts = result.formatted_address.split(',').map((s: string) => s.trim());
            // Take first 2-3 meaningful parts
            formattedAddress = addressParts.slice(0, Math.min(3, addressParts.length)).join(', ');
          }

          console.log("=== Final Formatted Address ===");
          console.log("Display:", formattedAddress);

          return {
            latitude: lat,
            longitude: lng,
            address: result.formatted_address,
            city: city || state || country || "Location",
            state,
            country,
            postalCode,
            formattedAddress: formattedAddress || result.formatted_address,
          };
        } else if (data.status === "ZERO_RESULTS") {
          // Even with zero results, try to get location name from nearby areas
          return {
            latitude: lat,
            longitude: lng,
            address: "Location detected",
            city: "Your Location",
            state: "",
            country: "",
            postalCode: "",
            formattedAddress: "Your Current Location",
          };
        } else if (data.status === "REQUEST_DENIED") {
          throw new Error(`API Error: ${data.error_message || "Request denied. Check API key."}`);
        } else if (data.status === "OVER_QUERY_LIMIT") {
          // Wait and retry
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error("API quota exceeded. Please try again later.");
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (error) {
        console.error(`Geocoding attempt ${attempt + 1} failed:`, error);
        
        // If this is the last attempt, return user-friendly fallback
        if (attempt === retries - 1) {
          return {
            latitude: lat,
            longitude: lng,
            address: "Location detected",
            city: "Your Location",
            state: "",
            country: "",
            postalCode: "",
            formattedAddress: "Your Current Location",
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    
    // Fallback (should never reach here, but TypeScript wants a return)
    return {
      latitude: lat,
      longitude: lng,
      address: "Location detected",
      city: "Your Location",
      state: "",
      country: "",
      postalCode: "",
      formattedAddress: "Your Current Location",
    };
  };

  const requestLocation = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!("geolocation" in navigator)) {
      setState({
        location: null,
        loading: false,
        error: "Geolocation is not supported by your browser",
        permissionDenied: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log("=== GPS Coordinates Obtained ===");
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        try {
          console.log("Calling Geocoding API...");
          const locationData = await getAddressFromCoords(latitude, longitude);
          
          console.log("=== Location Data Received ===");
          console.log("Location:", locationData);
          
          setState({
            location: locationData,
            loading: false,
            error: null,
            permissionDenied: false,
          });

          // Store in localStorage for persistence
          localStorage.setItem("userLocation", JSON.stringify(locationData));
          console.log("Location saved to localStorage");
        } catch (error) {
          console.error("Error getting address:", error);
          
          // Even if geocoding fails, we still have location
          const fallbackLocation: LocationData = {
            latitude,
            longitude,
            address: "Location detected",
            city: "Your Location",
            state: "",
            country: "",
            postalCode: "",
            formattedAddress: "Your Current Location",
          };
          
          setState({
            location: fallbackLocation,
            loading: false,
            error: null,
            permissionDenied: false,
          });

          // Store fallback location
          localStorage.setItem("userLocation", JSON.stringify(fallbackLocation));
        }
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        let permissionDenied = false;

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Please enable location access to use nearby services";
          permissionDenied = true;
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }

        setState({
          location: null,
          loading: false,
          error: errorMessage,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  useEffect(() => {
    // Check if location is already stored
    const storedLocation = localStorage.getItem("userLocation");
    
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setState({
          location: parsedLocation,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      } catch (error) {
        console.error("Error parsing stored location:", error);
        requestLocation();
      }
    } else {
      requestLocation();
    }
  }, []);

  const refreshLocation = () => {
    // Clear cache to force fresh location fetch
    localStorage.removeItem("userLocation");
    console.log("🔄 Refreshing location (cache cleared)");
    requestLocation();
  };

  return {
    ...state,
    refreshLocation,
  };
};
