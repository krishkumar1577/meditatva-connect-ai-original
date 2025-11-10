import { useEffect, useRef, memo } from "react";
import { Loader2 } from "lucide-react";

interface GoogleMapComponentProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    distance: number;
  }>;
  apiKey: string;
  onStoreClick?: (storeId: string) => void;
}

export const GoogleMapComponent = memo(({
  userLocation,
  stores,
  apiKey,
  onStoreClick
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!userLocation || !mapRef.current || loadingRef.current) return;

    loadingRef.current = true;

    // Load Google Maps Script
    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
          return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadGoogleMaps();

        if (!mapRef.current) return;

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi.medical",
              elementType: "geometry",
              stylers: [{ color: "#fce4ec" }]
            },
            {
              featureType: "poi.medical",
              elementType: "labels.text.fill",
              stylers: [{ color: "#c2185b" }]
            }
          ]
        });

        googleMapRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add user location marker
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#1B6CA8",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
          animation: google.maps.Animation.DROP,
          zIndex: 1000,
        });

        // Add user location info window
        const userInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <div style="font-weight: 600; color: #1B6CA8; margin-bottom: 4px;">📍 Your Location</div>
              <div style="font-size: 12px; color: #5A6A85;">Current Position</div>
            </div>
          `
        });

        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });

        markersRef.current.push(userMarker);

        // Add pharmacy markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });

        stores.forEach((store, index) => {
          const position = { lat: store.lat, lng: store.lon };
          bounds.extend(position);

          const marker = new google.maps.Marker({
            position,
            map,
            title: store.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#2ECC71",
              fillOpacity: 0.9,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            animation: google.maps.Animation.DROP,
            label: {
              text: (index + 1).toString(),
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "bold",
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; font-family: system-ui; max-width: 250px;">
                <div style="font-weight: 700; color: #0A2342; margin-bottom: 6px; font-size: 14px;">${store.name}</div>
                <div style="font-size: 12px; color: #5A6A85; margin-bottom: 6px; line-height: 1.4;">${store.address}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                  <span style="background: #E8F4F8; color: #1B6CA8; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${store.distance} km away
                  </span>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            if (onStoreClick) {
              onStoreClick(store.id);
            }
          });

          markersRef.current.push(marker);
        });

        // Fit map to show all markers
        if (stores.length > 0) {
          map.fitBounds(bounds);
          // Ensure minimum zoom level
          const listener = google.maps.event.addListener(map, "idle", () => {
            if (map.getZoom()! > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
          });
        }

      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      } finally {
        loadingRef.current = false;
      }
    };

    initializeMap();

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [userLocation, stores, apiKey, onStoreClick]);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border-2 border-[#4FC3F7]/20 shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      {loadingRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B6CA8] mx-auto mb-2" />
            <p className="text-sm text-[#5A6A85]">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
});

GoogleMapComponent.displayName = "GoogleMapComponent";
