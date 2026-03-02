import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { MessageCircle, Phone, Star, Shield, Home } from 'lucide-react-native';
import { API_BASE_URL, WS_BASE_URL } from '../../api/config';

const FreightAccepted = ({ onNavigate, freightId }) => {
  const idDoFrete = freightId || 1;
  const ws = useRef(null);

  const [drvLocation, setDrvLocation] = useState(null); // renamed to avoid conflicts
  const [userLocation, setUserLocation] = useState(null);
  const [motorista, setMotorista] = useState(null);
  const [statusCorrida, setStatusCorrida] = useState('Buscando motorista...');
  const [objetoConfirmadoIA, setObjetoConfirmadoIA] = useState(null);
  const [originLocation, setOriginLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDriverOrigin, setRouteDriverOrigin] = useState([]); // street route from driver to pickup

  useEffect(() => {
    const wsUrl = `${WS_BASE_URL}/ws/fretes/${idDoFrete}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const dados = JSON.parse(event.data);

      if (dados.latitude && dados.longitude) {
        setDrvLocation({ latitude: dados.latitude, longitude: dados.longitude });
      }

      if (dados.status === 'ACEITO' && dados.motorista) {
        setStatusCorrida('Motorista a caminho');
        setMotorista(dados.motorista);
      }

      if (dados.tipo === 'DETECCAO_OBJETO') {
        setObjetoConfirmadoIA(dados.objeto);
      }
    };

    return () => ws.current?.close();
  }, [idDoFrete]);

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();

    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    const geocodeAddress = async (address) => {
      if (!address) return null;
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lang=pt&limit=1`;
        const photonResp = await fetch(photonUrl, { headers: { Accept: 'application/json' } });
        if (photonResp.ok) {
          const photonJson = await photonResp.json();
          const feat = photonJson?.features?.[0];
          const coords = feat?.geometry?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            const lon = Number(coords[0]);
            const lat = Number(coords[1]);
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              return { latitude: lat, longitude: lon };
            }
          }
        }
      } catch {}

      try {
        const geocoded = await Location.geocodeAsync(address);
        if (Array.isArray(geocoded) && geocoded.length > 0) {
          return { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        }
      } catch {}

      return null;
    };

    const toPointIfValid = (lat, lng) => {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      return { latitude, longitude };
    };

    const loadRoute = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/fretes/${idDoFrete}`);
        if (!response.ok) return;
        const frete = await response.json();

        const originFromFrete = toPointIfValid(frete?.origem_lat, frete?.origem_lng);
        const destinationFromFrete = toPointIfValid(frete?.destino_lat, frete?.destino_lng);

        const [origin, destination] = await Promise.all([
          originFromFrete ? Promise.resolve(originFromFrete) : geocodeAddress(frete?.origem),
          destinationFromFrete ? Promise.resolve(destinationFromFrete) : geocodeAddress(frete?.destino),
        ]);

        setOriginLocation(origin);
        setDestinationLocation(destination);
        console.log('FreightAccepted geocoded points', { origin, destination });

        // fetch OSRM route once we have both points
        if (origin && destination) {
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
            console.log('FreightAccepted OSRM request', url);
            const r2 = await fetch(url);
            const d2 = await r2.json();
            console.log('FreightAccepted OSRM response', d2);
            if (d2.routes && d2.routes.length > 0) {
              const coords = d2.routes[0].geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }));
              setRouteCoords(coords);
            }
          } catch (err) {
            console.warn('FreightAccepted could not fetch route', err);
            setRouteCoords([]);
          }
        }

        // also fetch driver->origin route whenever drvLocation or originLocation changes
        if (drvLocation && originLocation) {
          try {
            const url2 = `https://router.project-osrm.org/route/v1/driving/${drvLocation.longitude},${drvLocation.latitude};${originLocation.longitude},${originLocation.latitude}?overview=full&geometries=geojson`;
            console.log('FreightAccepted OSRM driver->origin', url2);
            const r3 = await fetch(url2);
            const d3 = await r3.json();
            if (d3.routes && d3.routes.length > 0) {
              const coords2 = d3.routes[0].geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }));
              setRouteDriverOrigin(coords2);
            }
          } catch (err) {
            console.warn('FreightAccepted could not fetch driver->origin route', err);
            setRouteDriverOrigin([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar rota do frete:', error);
      }
    };

    loadRoute();
  }, [idDoFrete]);

  // recalc driver->origin whenever driver moves or origin known
  useEffect(() => {
    const fetchSegment = async () => {
      if (drvLocation && originLocation) {
        console.log('fetchSegment triggered', { drvLocation, originLocation });
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${drvLocation.longitude},${drvLocation.latitude};${originLocation.longitude},${originLocation.latitude}?overview=full&geometries=geojson`;
          console.log('FreightAccepted driver move OSRM', url);
          const resp = await fetch(url);
          const js = await resp.json();
          console.log('FreightAccepted driver move response', js);
          if (js.routes && js.routes.length > 0) {
            const coords = js.routes[0].geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }));
            setRouteDriverOrigin(coords);
            console.log('Updated routeDriverOrigin with', coords.length, 'points');
          }
        } catch (e) {
          console.warn('error updating driver->origin route', e);
          setRouteDriverOrigin([]);
        }
      }
    };
    fetchSegment();
  }, [drvLocation, originLocation]);

  const distanceKm = (a, b) => {
    if (!a || !b) return null;
    const R = 6371;
    const dLat = (b.latitude - a.latitude) * Math.PI / 180;
    const dLon = (b.longitude - a.longitude) * Math.PI / 180;
    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  useEffect(() => {
    if (!drvLocation || !originLocation || !destinationLocation) return;

    const toOrigin = distanceKm(drvLocation, originLocation);
    const toDestination = distanceKm(drvLocation, destinationLocation);

    if (toOrigin !== null && toOrigin <= 0.2) {
      setStatusCorrida('Motorista indo para o destino');
    } else if (toDestination !== null && toDestination <= 0.2) {
      setStatusCorrida('Entrega chegando ao destino');
    } else {
      setStatusCorrida('Motorista a caminho da coleta');
    }
  }, [drvLocation, originLocation, destinationLocation]);

  const mapRegion = useMemo(() => {
    // guard against undefined just in case bundle messes up
    if (typeof drvLocation !== 'undefined' && drvLocation) {
      return { ...drvLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }
    if (userLocation) {
      return { ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }
    return { latitude: -15.601, longitude: -56.097, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  }, [drvLocation, userLocation]);

  if (!userLocation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Obtendo localizacao...</Text>
      </View>
    );
  }

  // if we have a routed line use it, otherwise fall back to straight segments
  const baseCoords = routeCoords.length > 0 ? routeCoords : [];
  const fallbackCoords = [];
  if (typeof drvLocation !== 'undefined' && drvLocation) fallbackCoords.push(drvLocation);
  if (originLocation) fallbackCoords.push(originLocation);
  if (destinationLocation) fallbackCoords.push(destinationLocation);

  // compute final polyline: if we know both segments, stitch them together
  let polylineCoords = baseCoords.length > 0 ? baseCoords : fallbackCoords;
  if (routeDriverOrigin.length >= 2 && baseCoords.length >= 1) {
    // combine driver->origin then origin->destination
    polylineCoords = [...routeDriverOrigin, ...baseCoords];
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation
        followsUserLocation
      >
        <Marker coordinate={userLocation} title="Voce" />

        {drvLocation && (
          <Marker coordinate={drvLocation} title="Motorista">
            <View style={styles.driverMarker}><Text>TRK</Text></View>
          </Marker>
        )}

        {originLocation && (
          <Marker coordinate={originLocation} title="Origem">
            <View style={styles.routeMarker}><Text style={styles.routeMarkerText}>O</Text></View>
          </Marker>
        )}

        {destinationLocation && (
          <Marker coordinate={destinationLocation} title="Destino">
            <View style={[styles.routeMarker, styles.destinationMarker]}><Text style={styles.routeMarkerText}>D</Text></View>
          </Marker>
        )}

        {routeDriverOrigin.length >= 2 && (
          <Polyline coordinates={routeDriverOrigin} strokeColor="#10B981" strokeWidth={3} lineDashPattern={[6,4]} />
        )}
        {polylineCoords.length >= 2 && (
          <Polyline coordinates={polylineCoords} strokeColor="#1E3A8A" strokeWidth={4} />
        )}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>{statusCorrida}</Text>
          <Text style={styles.statusSubtitle}>Acompanhe em tempo real</Text>
        </View>

        {objetoConfirmadoIA && (
          <View style={styles.aiNotification}>
            <Shield color="white" size={16} />
            <Text style={styles.aiText}>Objeto confirmado: {objetoConfirmadoIA}</Text>
          </View>
        )}

        {motorista && (
          <View style={styles.card}>
            <View style={styles.driverHeader}>
              <Image source={{ uri: motorista.foto }} style={styles.avatar} />
              <View style={styles.driverInfo}>
                <Text style={styles.name}>{motorista.nome}</Text>
                <View style={styles.ratingContainer}>
                  <Star color="#F59E0B" size={14} fill="#F59E0B" />
                  <Text style={styles.rating}>{motorista.nota}</Text>
                </View>
                <Text style={styles.vehicle}>{motorista.veiculo} - {motorista.placa}</Text>
              </View>
              <View style={styles.plateContainer}><Text style={styles.plate}>{motorista.placa}</Text></View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.chatBtn]}
                onPress={() => onNavigate('chat', { freightId: idDoFrete })}
              >
                <MessageCircle color="white" size={20} />
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.phoneBtn]}
                onPress={() => Linking.openURL(`tel:${motorista.telefone}`)}
              >
                <Phone color="#4B5563" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* always-available chat access */}
        <TouchableOpacity
          style={styles.floatingChat}
          onPress={() => onNavigate('chat', { freightId: idDoFrete })}
        >
          <MessageCircle color="white" size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.homeBtn}>
          <Home color="white" size={20} />
          <Text style={styles.homeText}>Voltar ao inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  driverMarker: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  routeMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationMarker: { backgroundColor: '#EF4444' },
  routeMarkerText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingTop: 0,
  },
  statusBox: {
    backgroundColor: '#2563EB',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
  },
  statusTitle: { color: 'white', fontWeight: 'bold' },
  statusSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, textAlign: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    marginBottom: 12,
  },
  aiNotification: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'center',
    elevation: 4,
  },
  aiText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  driverHeader: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  driverInfo: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, color: '#6B7280' },
  vehicle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  plateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    borderRadius: 4,
    height: 24,
  },
  plate: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  chatBtn: { backgroundColor: '#1E3A8A', flex: 2 },
  chatText: { color: 'white', fontWeight: 'bold' },
  phoneBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  floatingChat: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  homeText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});

export default FreightAccepted;
