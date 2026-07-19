import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon assets issue in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapModule = ({ 
  mode = 'viewer', 
  center = [12.9716, 77.5946], // Default Bangalore
  zoom = 13,
  markers = [], 
  onSelectLocation = null,
  isDark = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const markerGroupRef = useRef(null);
  const heatGroupRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map Instance
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Create marker groups
    markerGroupRef.current = L.layerGroup().addTo(map);
    heatGroupRef.current = L.layerGroup().addTo(map);

    // Set map tiles based on theme
    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const activeTileUrl = isDark ? darkTileUrl : lightTileUrl;

    const tileLayer = L.tileLayer(activeTileUrl, {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

    // Click handler for 'select' mode
    if (mode === 'select') {
      // Add initial selector pin
      markerInstanceRef.current = L.marker(center, { draggable: true }).addTo(map);

      const triggerLocationSelect = async (lat, lng) => {
        let address = 'Loading address...';
        if (onSelectLocation) {
          onSelectLocation({ lat, lng, address });
        }

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await response.json();
          if (data && data.display_name) {
            address = data.display_name;
          } else {
            address = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
        } catch (err) {
          address = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }

        if (onSelectLocation) {
          onSelectLocation({ lat, lng, address });
        }
      };

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerInstanceRef.current.setLatLng([lat, lng]);
        triggerLocationSelect(lat, lng);
      });

      // Handle marker drag
      markerInstanceRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        triggerLocationSelect(lat, lng);
      });
    }

    return () => {
      map.off();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mode, isDark]);

  // Update center when changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
      if (mode === 'select' && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng(center);
      }
    }
  }, [center, zoom]);

  // Geolocation detector
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          if (mode === 'select' && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([latitude, longitude]);
            // Reverse geocode
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
              .then(res => res.json())
              .then(data => {
                if (onSelectLocation) {
                  onSelectLocation({
                    lat: latitude,
                    lng: longitude,
                    address: data.display_name || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                  });
                }
              })
              .catch(() => {
                if (onSelectLocation) {
                  onSelectLocation({ lat: latitude, lng: longitude, address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                }
              });
          }
        }
      },
      (error) => {
        console.error('Location error:', error);
        alert('Could not locate your coordinates. Using default smart node.');
      }
    );
  };

  // Draw markers & heatmaps
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    const heatGroup = heatGroupRef.current;

    if (!map || !markerGroup || !heatGroup) return;

    // Clear previous
    markerGroup.clearLayers();
    heatGroup.clearLayers();

    if (mode === 'viewer') {
      markers.forEach(item => {
        const loc = item.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

        let priorityColor = '#3b82f6'; // medium
        if (item.priority === 'critical') priorityColor = '#ef4444';
        else if (item.priority === 'high') priorityColor = '#f59e0b';
        else if (item.priority === 'low') priorityColor = '#10b981';

        const customDivIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${priorityColor}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
            <p style="margin: 0; font-size: 8px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">${item.category}</p>
            <h4 style="margin: 3px 0 6px 0; font-size: 12px; font-weight: 700; color: #1e293b;">${item.title}</h4>
            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
              <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: ${priorityColor}20; color: ${priorityColor}; text-transform: capitalize;">${item.priority}</span>
              <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: #e2e8f0; color: #475569; text-transform: capitalize;">${item.status}</span>
            </div>
            <p style="margin: 0; font-size: 10px; color: #64748b; line-height: 1.3;">${loc.address.substring(0, 75)}${loc.address.length > 75 ? '...' : ''}</p>
          </div>
        `;

        L.marker([loc.lat, loc.lng], { icon: customDivIcon })
          .bindPopup(popupContent)
          .addTo(markerGroup);
      });
    }

    if (mode === 'heatmap') {
      // Draw heatmap circles
      markers.forEach(item => {
        const loc = item.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

        // Visual Heatmap
        let fillColor = '#ef4444'; // critical/high default
        let radius = 250; // meters
        if (item.priority === 'medium') {
          fillColor = '#f59e0b';
          radius = 180;
        } else if (item.priority === 'low') {
          fillColor = '#3b82f6';
          radius = 120;
        }

        L.circle([loc.lat, loc.lng], {
          color: 'transparent',
          fillColor: fillColor,
          fillOpacity: 0.35,
          radius: radius
        })
        .bindPopup(`<strong style="font-family: sans-serif; font-size:11px;">AI Alert Zone (${item.category})</strong>`)
        .addTo(heatGroup);

        // Standard minor marker in center
        const dotIcon = L.divIcon({
          className: 'dot-marker',
          html: `<div style="background-color: ${fillColor}; width: 6px; height: 6px; border-radius: 50%;"></div>`,
          iconSize: [6, 6],
          iconAnchor: [3, 3]
        });

        L.marker([loc.lat, loc.lng], { icon: dotIcon }).addTo(markerGroup);
      });
    }
  }, [markers, mode]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
      {mode === 'select' && (
        <button
          type="button"
          onClick={detectUserLocation}
          className="absolute bottom-4 right-4 z-40 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-bold text-slate-800 shadow-lg hover:bg-slate-50 border border-slate-200"
          style={{ zIndex: 1000 }}
        >
          <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          GPS Locate
        </button>
      )}
    </div>
  );
};

export default MapModule;
