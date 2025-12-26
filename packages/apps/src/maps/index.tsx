/**
 * Maps App
 *
 * Map viewer for zOS using OpenStreetMap (Leaflet).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Map as MapIcon,
  Search,
  Plus,
  Minus,
  Layers,
  Navigation,
  MapPin,
  Star,
  Home,
  Briefcase,
  ChevronRight,
  X,
  Route,
  Compass,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface MapsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon?: 'home' | 'work' | 'star' | 'pin';
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

type MapStyle = 'standard' | 'satellite' | 'terrain';

// ============================================================================
// Mock Data
// ============================================================================

const mockFavorites: Location[] = [
  {
    id: 'home',
    name: 'Home',
    address: '123 Main Street, San Francisco, CA 94102',
    lat: 37.7749,
    lng: -122.4194,
    icon: 'home',
  },
  {
    id: 'work',
    name: 'Work',
    address: '456 Market St, San Francisco, CA 94103',
    lat: 37.7897,
    lng: -122.4009,
    icon: 'work',
  },
  {
    id: 'fav1',
    name: 'Golden Gate Bridge',
    address: 'Golden Gate Bridge, San Francisco, CA',
    lat: 37.8199,
    lng: -122.4783,
    icon: 'star',
  },
  {
    id: 'fav2',
    name: 'Fisherman\'s Wharf',
    address: 'Fisherman\'s Wharf, San Francisco, CA',
    lat: 37.8080,
    lng: -122.4177,
    icon: 'star',
  },
];

const mockSearchResults: SearchResult[] = [
  { id: 's1', name: 'Hanzo AI HQ', address: '100 AI Plaza, San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { id: 's2', name: 'Lux Network Office', address: '200 Blockchain Ave, Austin, TX', lat: 30.2672, lng: -97.7431 },
  { id: 's3', name: 'Zoo Labs Research', address: '300 Science Way, Boston, MA', lat: 42.3601, lng: -71.0589 },
];

// OpenStreetMap tile URLs for different styles
const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
  },
};

// ============================================================================
// Map Canvas Component (Simple OSM implementation without Leaflet dependency)
// ============================================================================

interface MapCanvasProps {
  center: { lat: number; lng: number };
  zoom: number;
  style: MapStyle;
  pins: Location[];
  onMapClick?: (lat: number, lng: number) => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ center, zoom, style, pins }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<{ x: number; y: number; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Convert lat/lng to tile coordinates
  const latLngToTile = useCallback((lat: number, lng: number, z: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, z));
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, z)
    );
    return { x, y };
  }, []);

  // Convert lat/lng to pixel position relative to center
  const latLngToPixel = useCallback((lat: number, lng: number, centerLat: number, centerLng: number, z: number) => {
    const scale = Math.pow(2, z) * 256;
    const worldX = ((lng + 180) / 360) * scale;
    const worldY = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * scale;
    const centerWorldX = ((centerLng + 180) / 360) * scale;
    const centerWorldY = ((1 - Math.log(Math.tan((centerLat * Math.PI) / 180) + 1 / Math.cos((centerLat * Math.PI) / 180)) / Math.PI) / 2) * scale;
    return {
      x: worldX - centerWorldX,
      y: worldY - centerWorldY,
    };
  }, []);

  // Generate visible tiles
  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerTile = latLngToTile(center.lat, center.lng, zoom);
    const tilesX = Math.ceil(width / 256) + 2;
    const tilesY = Math.ceil(height / 256) + 2;

    const newTiles: { x: number; y: number; url: string }[] = [];
    const tileUrl = tileLayers[style].url;

    for (let dx = -Math.floor(tilesX / 2); dx <= Math.floor(tilesX / 2); dx++) {
      for (let dy = -Math.floor(tilesY / 2); dy <= Math.floor(tilesY / 2); dy++) {
        const x = centerTile.x + dx;
        const y = centerTile.y + dy;
        const maxTile = Math.pow(2, zoom);

        if (y >= 0 && y < maxTile) {
          const wrappedX = ((x % maxTile) + maxTile) % maxTile;
          const url = tileUrl
            .replace('{z}', zoom.toString())
            .replace('{x}', wrappedX.toString())
            .replace('{y}', y.toString())
            .replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)]);
          newTiles.push({ x: dx, y: dy, url });
        }
      }
    }

    setTiles(newTiles);
  }, [center, zoom, style, latLngToTile]);

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Tile Layer */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {tiles.map((tile, i) => (
          <img
            key={`${tile.x}-${tile.y}-${i}`}
            src={tile.url}
            alt=""
            className="absolute"
            style={{
              left: tile.x * 256 - 128,
              top: tile.y * 256 - 128,
              width: 256,
              height: 256,
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Pins */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {pins.map((pin) => {
          const pos = latLngToPixel(pin.lat, pin.lng, center.lat, center.lng, zoom);
          return (
            <div
              key={pin.id}
              className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer"
              style={{ left: pos.x, top: pos.y }}
              title={pin.name}
            >
              <div className="relative">
                <div className="w-8 h-10 flex items-center justify-center">
                  <svg viewBox="0 0 24 36" className="w-full h-full drop-shadow-lg">
                    <path
                      d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
                      fill={pin.icon === 'home' ? '#3b82f6' : pin.icon === 'work' ? '#8b5cf6' : '#ef4444'}
                    />
                    <circle cx="12" cy="12" r="6" fill="white" />
                  </svg>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 flex items-center justify-center">
                  {pin.icon === 'home' && <Home className="w-3 h-3 text-blue-500" />}
                  {pin.icon === 'work' && <Briefcase className="w-3 h-3 text-purple-500" />}
                  {pin.icon === 'star' && <Star className="w-3 h-3 text-red-500" />}
                  {pin.icon === 'pin' && <MapPin className="w-3 h-3 text-red-500" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 text-[10px] text-gray-600 px-1">
        {tileLayers[style].attribution.replace('&copy;', '\u00A9')}
      </div>
    </div>
  );
};

// ============================================================================
// Maps Window Component
// ============================================================================

const MapsWindow: React.FC<MapsWindowProps> = ({ onClose, onFocus }) => {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco
  const [zoom, setZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [pins, setPins] = useState<Location[]>(mockFavorites);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulate search with mock data
      const results = mockSearchResults.filter(
        r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             r.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 1));

  const handleLocationSelect = (location: Location | SearchResult) => {
    setCenter({ lat: location.lat, lng: location.lng });
    setZoom(15);
    setSelectedLocation(location as Location);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCurrentLocation = () => {
    // Simulate getting current location (in real app, use navigator.geolocation)
    setCenter({ lat: 37.7749, lng: -122.4194 });
    setZoom(15);
  };

  const handleDropPin = () => {
    const newPin: Location = {
      id: `pin-${Date.now()}`,
      name: 'Dropped Pin',
      address: `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
      lat: center.lat,
      lng: center.lng,
      icon: 'pin',
    };
    setPins([...pins, newPin]);
    setSelectedLocation(newPin);
  };

  const removePin = (pinId: string) => {
    setPins(pins.filter(p => p.id !== pinId));
    if (selectedLocation?.id === pinId) {
      setSelectedLocation(null);
    }
  };

  const getLocationIcon = (icon?: string) => {
    switch (icon) {
      case 'home':
        return <Home className="w-4 h-4 text-blue-400" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'star':
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <MapPin className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <ZWindow
      title="Maps"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 1000, height: 700 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-72 bg-[#2c2c2e] border-r border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a place..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-3 h-3 text-white/40" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-[#3c3c3e] rounded-lg border border-white/10 overflow-hidden">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{result.name}</p>
                        <p className="text-white/40 text-xs truncate">{result.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <h3 className="text-white/40 text-xs uppercase tracking-wider px-2 py-2">Favorites</h3>
                {mockFavorites.map(location => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedLocation?.id === location.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                    }`}
                  >
                    {getLocationIcon(location.icon)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{location.name}</p>
                      <p className="text-white/40 text-xs truncate">{location.address}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Recent Pins */}
              {pins.filter(p => p.icon === 'pin').length > 0 && (
                <div className="p-2 border-t border-white/10">
                  <h3 className="text-white/40 text-xs uppercase tracking-wider px-2 py-2">Dropped Pins</h3>
                  {pins.filter(p => p.icon === 'pin').map(pin => (
                    <div
                      key={pin.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedLocation?.id === pin.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <button
                        onClick={() => handleLocationSelect(pin)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <MapPin className="w-4 h-4 text-red-400" />
                        <div className="min-w-0">
                          <p className="text-white text-sm">{pin.name}</p>
                          <p className="text-white/40 text-xs">{pin.address}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => removePin(pin.id)}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Directions Panel */}
            {showDirections && (
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Directions</h3>
                  <button
                    onClick={() => setShowDirections(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Start location"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                  <input
                    type="text"
                    placeholder="End location"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Get Directions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Map Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/10 transition-colors block"
                title="Zoom In"
              >
                <Plus className="w-5 h-5 text-white/70" />
              </button>
              <div className="border-t border-white/10" />
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/10 transition-colors block"
                title="Zoom Out"
              >
                <Minus className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Style Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                className={`p-2 bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 hover:bg-white/10 transition-colors ${
                  showStyleMenu ? 'bg-white/10' : ''
                }`}
                title="Map Style"
              >
                <Layers className="w-5 h-5 text-white/70" />
              </button>

              {showStyleMenu && (
                <div className="absolute top-full right-0 mt-2 bg-[#2c2c2e] rounded-lg shadow-xl border border-white/10 overflow-hidden w-36">
                  {(['standard', 'satellite', 'terrain'] as MapStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => {
                        setMapStyle(style);
                        setShowStyleMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm capitalize transition-colors ${
                        mapStyle === style ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Location */}
            <button
              onClick={handleCurrentLocation}
              className="p-2 bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 hover:bg-white/10 transition-colors"
              title="Current Location"
            >
              <Navigation className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Left Controls */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {/* Toggle Sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 hover:bg-white/10 transition-colors ${
                showSidebar ? 'bg-white/10' : ''
              }`}
              title="Toggle Sidebar"
            >
              <Search className="w-5 h-5 text-white/70" />
            </button>

            {/* Drop Pin */}
            <button
              onClick={handleDropPin}
              className="p-2 bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 hover:bg-white/10 transition-colors"
              title="Drop Pin"
            >
              <MapPin className="w-5 h-5 text-white/70" />
            </button>

            {/* Directions */}
            <button
              onClick={() => {
                setShowSidebar(true);
                setShowDirections(true);
              }}
              className="p-2 bg-[#2c2c2e] rounded-lg shadow-lg border border-white/10 hover:bg-white/10 transition-colors"
              title="Directions"
            >
              <Route className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Compass */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="w-12 h-12 bg-[#2c2c2e] rounded-full shadow-lg border border-white/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white/70" />
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 z-10 bg-[#2c2c2e] rounded-lg shadow-xl border border-white/10 p-4 max-w-sm">
              <div className="flex items-start gap-3">
                {getLocationIcon(selectedLocation.icon)}
                <div className="flex-1">
                  <h3 className="text-white font-medium">{selectedLocation.name}</h3>
                  <p className="text-white/50 text-sm">{selectedLocation.address}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowSidebar(true);
                        setShowDirections(true);
                      }}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                    >
                      Directions
                    </button>
                    <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-lg transition-colors">
                      Share
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>
          )}

          {/* Map Canvas */}
          <MapCanvas
            center={center}
            zoom={zoom}
            style={mapStyle}
            pins={pins}
          />
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Maps app manifest
 */
export const MapsManifest = {
  identifier: 'ai.hanzo.maps',
  name: 'Maps',
  version: '1.0.0',
  description: 'Map viewer for zOS',
  category: 'utilities' as const,
  permissions: ['location'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 1000, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Maps menu bar configuration
 */
export const MapsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newWindow', label: 'New Window', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item' as const, id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item' as const, id: 'actualSize', label: 'Actual Size', shortcut: '⌘0' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'standard', label: 'Standard Map' },
        { type: 'item' as const, id: 'satellite', label: 'Satellite' },
        { type: 'item' as const, id: 'terrain', label: 'Terrain' },
      ],
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { type: 'item' as const, id: 'home', label: 'Home', shortcut: '⌘⇧H' },
        { type: 'item' as const, id: 'work', label: 'Work', shortcut: '⌘⇧W' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'currentLocation', label: 'Current Location', shortcut: '⌘L' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'dropPin', label: 'Drop Pin', shortcut: '⌘D' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'mapsHelp', label: 'Maps Help' },
      ],
    },
  ],
};

/**
 * Maps dock configuration
 */
export const MapsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'search', label: 'Search Location...' },
    { type: 'item' as const, id: 'directions', label: 'Get Directions...' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'home', label: 'Go to Home' },
    { type: 'item' as const, id: 'work', label: 'Go to Work' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Maps App definition for registry
 */
export const MapsApp = {
  manifest: MapsManifest,
  component: MapsWindow,
  icon: MapIcon,
  menuBar: MapsMenuBar,
  dockConfig: MapsDockConfig,
};

export default MapsWindow;
