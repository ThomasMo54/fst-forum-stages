import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OfferDto } from '../../services/offer.service';
import GeocodingService, { type GeocodingResult } from '../../services/geocoding.service';
import './OffersMap.css';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

// Custom marker icon for offers
const offerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="#2c3e50" d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.42-3.58-8-8-8z"/>
      <circle fill="#3498db" cx="12" cy="8" r="5"/>
      <path fill="#fff" d="M12 4.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  `),
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
});

interface OffersMapProps {
    offers: OfferDto[];
    companyNames: Record<string, string>;
    companyCities: Record<string, string>;
    companyAddresses: Record<string, string>;
    companyPostalCodes: Record<string, string>;
    onOfferClick: (offer: OfferDto) => void;
}

interface OfferMarker {
    offer: OfferDto;
    coordinates: GeocodingResult;
}

// Component to fit map bounds to markers
const MapBoundsUpdater: React.FC<{ markers: OfferMarker[] }> = ({ markers }) => {
    const map = useMap();

    useEffect(() => {
        if (markers.length === 0) return;

        const bounds = L.latLngBounds(
            markers.map(m => [m.coordinates.lat, m.coordinates.lon])
        );

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 13
        });
    }, [markers, map]);

    return null;
};

const OffersMap: React.FC<OffersMapProps> = ({
                                                 offers,
                                                 companyNames,
                                                 companyCities,
                                                 companyAddresses,
                                                 companyPostalCodes,
                                                 onOfferClick
                                             }) => {
    const [markers, setMarkers] = useState<OfferMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Geocode all offers
    useEffect(() => {
        let isMounted = true;

        const geocodeOffers = async () => {
            setLoading(true);
            setError('');

            try {
                // Prepare addresses for batch geocoding
                const addressesToGeocode = offers.map(offer => ({
                    id: offer.id,
                    address: companyAddresses[offer.companyId],
                    city: companyCities[offer.companyId],
                    postalCode: companyPostalCodes[offer.companyId]
                }));

                // Geocode all addresses
                const results = await GeocodingService.geocodeBatch(addressesToGeocode);

                if (!isMounted) return;

                // Build markers array
                const newMarkers: OfferMarker[] = [];
                offers.forEach(offer => {
                    const coords = results.get(offer.id);
                    if (coords) {
                        newMarkers.push({
                            offer,
                            coordinates: coords
                        });
                    }
                });

                setMarkers(newMarkers);

                if (newMarkers.length === 0) {
                    setError('Aucune offre n\'a pu être géolocalisée. Vérifiez les adresses des entreprises.');
                }
            } catch (err) {
                console.error('Geocoding error:', err);
                if (isMounted) {
                    setError('Erreur lors de la géolocalisation des offres.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void geocodeOffers();

        return () => {
            isMounted = false;
        };
    }, [offers, companyAddresses, companyCities, companyPostalCodes]);

    // Default center (France)
    const defaultCenter: [number, number] = [46.603354, 1.888334];

    if (loading) {
        return (
            <div className="map-container loading">
                <div className="map-loading-spinner">
                    <div className="spinner"></div>
                    <p>Géolocalisation des offres en cours...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="map-container error">
                <div className="map-error">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-container">
            <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map(({ offer, coordinates }) => (
                    <Marker
                        key={offer.id}
                        position={[coordinates.lat, coordinates.lon]}
                        icon={offerIcon}
                        eventHandlers={{
                            click: () => onOfferClick(offer)
                        }}
                    >
                        <Popup>
                            <div className="map-popup">
                                <h4>{offer.title}</h4>
                                <p className="popup-company">
                                    <i className="fa-solid fa-building"></i>
                                    {companyNames[offer.companyId] || `Entreprise #${offer.companyId}`}
                                </p>
                                <p className="popup-location">
                                    <i className="fa-solid fa-location-dot"></i>
                                    {companyCities[offer.companyId]}
                                </p>
                                <button
                                    className="popup-button"
                                    onClick={() => onOfferClick(offer)}
                                >
                                    Voir les détails
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBoundsUpdater markers={markers} />
            </MapContainer>

            <div className="map-info-badge">
                <i className="fa-solid fa-map-pin"></i>
                {markers.length} offre{markers.length > 1 ? 's' : ''} géolocalisée{markers.length > 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default OffersMap;