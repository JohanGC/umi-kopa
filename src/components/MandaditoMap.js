// components/MandaditoMap.js - VERSIÓN CORREGIDA
import React, { useEffect, useState, useRef, useCallback } from 'react';

const MandaditoMap = ({ ubicacionActual, disponible, usuario, conectado }) => {
  const [map, setMap] = useState(null);
  const [mapError, setMapError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapsScriptRef = useRef(null);
  const markersRef = useRef([]); // ✅ REF para manejar marcadores

  // ✅ CORREGIDO: Limpiar marcadores de forma segura
  const clearMarkers = useCallback(() => {
    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    }
  }, []);

  // ✅ CORREGIDO: Cargar mandaditos con manejo robusto
  const cargarMandaditos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No hay token disponible');
        return;
      }

      const response = await fetch('/api/mandaditos/disponibles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const text = await response.text();
      
      if (!text) {
        return;
      }

      try {
        const data = JSON.parse(text);
        console.log('✅ Mandaditos cargados:', Array.isArray(data) ? data.length : 'no-array');
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
      }

    } catch (error) {
      console.error('❌ Error en carga de mandaditos:', error);
    }
  }, []);

  // ✅ CORREGIDO: Inicializar mapa de forma segura
  const initializeMap = useCallback(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('API Key de Google Maps no configurada');
      setIsLoading(false);
      return;
    }

    try {
      const mapElement = mapRef.current;
      if (!mapElement) {
        throw new Error('Elemento del mapa no encontrado');
      }

      if (!window.google?.maps?.Map) {
        throw new Error('Google Maps API no cargada correctamente');
      }

      // Limpiar marcadores anteriores
      clearMarkers();

      const mapOptions = {
        center: ubicacionActual || { lat: 6.2442, lng: -75.5812 },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };

      const mapInstance = new window.google.maps.Map(mapElement, mapOptions);
      setMap(mapInstance);
      setMapLoaded(true);
      setMapError('');
      setIsLoading(false);
      
      // ✅ AGREGAR MARCADOR DE FORMA SEGURA
      if (ubicacionActual && window.google.maps.Marker) {
        const marker = new window.google.maps.Marker({
          position: ubicacionActual,
          map: mapInstance,
          title: 'Tu ubicación actual',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });
        markersRef.current.push(marker);
      }

    } catch (error) {
      console.error('❌ Error en initializeMap:', error);
      setMapError(`Error al inicializar el mapa: ${error.message}`);
      setIsLoading(false);
    }
  }, [ubicacionActual, clearMarkers]);

  // ✅ CORREGIDO: Cargar Google Maps API con mejor manejo
  const loadGoogleMaps = useCallback(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('API Key no configurada');
      setIsLoading(false);
      return;
    }

    // Si ya está cargado, inicializar
    if (window.google?.maps) {
      console.log('✅ Google Maps ya está cargado');
      initializeMap();
      return;
    }

    // Evitar cargar múltiples veces
    if (window.googleMapsLoading || document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      console.log('⏳ Google Maps ya se está cargando...');
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          initializeMap();
        }
      }, 100);
      return;
    }

    console.log('📥 Cargando Google Maps API...');
    setIsLoading(true);
    window.googleMapsLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API cargada');
      window.googleMapsLoading = false;
      mapsScriptRef.current = null;
      initializeMap();
    };
    
    script.onerror = (error) => {
      console.error('❌ Error cargando Google Maps:', error);
      setMapError('Error cargando Google Maps');
      setIsLoading(false);
      window.googleMapsLoading = false;
      mapsScriptRef.current = null;
    };
    
    mapsScriptRef.current = script;
    document.head.appendChild(script);
  }, [initializeMap]);

  // ✅ EFECTO PRINCIPAL CON CLEANUP MEJORADO
  useEffect(() => {
    loadGoogleMaps();
    cargarMandaditos();

    return () => {
      // ✅ CLEANUP SEGURO: Limpiar marcadores y recursos
      clearMarkers();
      
      if (mapsScriptRef.current) {
        try {
          document.head.removeChild(mapsScriptRef.current);
        } catch (error) {
          console.warn('⚠️ Error removiendo script:', error);
        }
      }
      window.googleMapsLoading = false;
    };
  }, [loadGoogleMaps, cargarMandaditos, clearMarkers]);

  // ✅ ACTUALIZAR UBICACIÓN CON MANEJO SEGURO
  useEffect(() => {
    if (map && ubicacionActual && window.google?.maps?.Marker) {
      // Limpiar marcadores anteriores
      clearMarkers();
      
      // Agregar nuevo marcador
      const marker = new window.google.maps.Marker({
        position: ubicacionActual,
        map: map,
        title: 'Ubicación actual',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#34A853',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });
      markersRef.current.push(marker);
      
      // Centrar mapa
      map.setCenter(ubicacionActual);
    }
  }, [map, ubicacionActual, clearMarkers]);

  return (
    <div className="h-100 w-100 position-relative">
      {/* Panel de errores */}
      {mapError && (
        <div className="alert alert-warning m-3 position-absolute top-0 start-0 end-0 z-3">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <strong>⚠️ Mapa no disponible</strong>
              <div className="mt-1">{mapError}</div>
            </div>
            <button 
              className="btn btn-sm btn-outline-warning ms-2"
              onClick={() => setMapError('')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div 
        ref={mapRef}
        className="w-100 h-100"
        style={{ 
          minHeight: '500px',
          backgroundColor: '#e9ecef'
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-light rounded">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando mapa...</span>
            </div>
            <h5>Cargando Mapa</h5>
            <p className="text-muted text-center">
              Inicializando servicio de mapas...
            </p>
          </div>
        )}
      </div>

      {/* Panel de información */}
      {ubicacionActual && (
        <div className="position-absolute top-0 end-0 m-3">
          <div className="card shadow-sm">
            <div className="card-header py-1">
              <small><strong>📍 Tu Ubicación</strong></small>
            </div>
            <div className="card-body p-2">
              <small>
                <div>Lat: {ubicacionActual.lat.toFixed(6)}</div>
                <div>Lng: {ubicacionActual.lng.toFixed(6)}</div>
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandaditoMap;