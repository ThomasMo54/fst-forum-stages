import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OfferDto } from '../../services/offer.service';
import GeocodingService, { type GeocodingResult } from '../../services/geocoding.service';
import './OffersMap.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: iconShadow });

const createMarkerIcon = (count: number) =>
    new L.DivIcon({
        html: `<div class="custom-cluster-marker"><div class="cluster-inner"><span>${count}</span></div></div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

interface OffersMapProps {
    offers: OfferDto[];
    companyNames: Record<string, string>;
    companyCities: Record<string, string>;
    companyAddresses: Record<string, string>;
    companyPostalCodes: Record<string, string>;
    onOfferClick: (offer: OfferDto) => void;
}

interface OfferWithMeta {
    offer: OfferDto;
    companyName: string;
}

interface LocationGroup {
    key: string;
    coordinates: GeocodingResult;
    city: string;
    items: OfferWithMeta[];
}

const SNAP_PRECISION = 0.005;

const snap = (value: number) => Math.round(value / SNAP_PRECISION) * SNAP_PRECISION;

const snapKey = (lat: number, lon: number) => `${snap(lat).toFixed(3)},${snap(lon).toFixed(3)}`;


/**
 * Groups every geocoded offer by snapped geographic position.
 * Offers from *different* companies that land on the same grid cell
 * end up in the same group — no overlapping markers.
 */
function buildLocationGroups(
    offers: OfferDto[],
    geocoded: Map<string, GeocodingResult | null>,
    companyNames: Record<string, string>,
    companyCities: Record<string, string>
): LocationGroup[] {
    const map = new Map<string, LocationGroup>();

    for (const offer of offers) {
        const coords = geocoded.get(offer.id);
        if (!coords) continue;

        const key = snapKey(coords.lat, coords.lon);
        const existing = map.get(key);

        const item: OfferWithMeta = {
            offer,
            companyName: companyNames[offer.companyId] ?? `Entreprise #${offer.companyId}`,
        };

        if (existing) {
            existing.items.push(item);
        } else {
            map.set(key, {
                key,
                coordinates: coords,
                city: companyCities[offer.companyId] ?? 'Non renseigné',
                items: [item],
            });
        }
    }

    return Array.from(map.values());
}

const MapBoundsUpdater: React.FC<{ groups: LocationGroup[] }> = ({ groups }) => {
    const map = useMap();

    useEffect(() => {
        if (groups.length === 0) return;
        const bounds = L.latLngBounds(groups.map(g => [g.coordinates.lat, g.coordinates.lon]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }, [groups, map]);

    return null;
};

const OfferCard: React.FC<{ item: OfferWithMeta; onClick: () => void }> = ({ item, onClick }) => (
    <div className="popup-offer-item" onClick={onClick}>
        <div className="popup-offer-content">
            <span className="popup-offer-company">
                <i className="fa-solid fa-building"></i> {item.companyName}
            </span>
            <h5 className="popup-offer-title">{item.offer.title}</h5>
            <div className="popup-offer-details">
                {item.offer.internshipDuration && (
                    <span className="popup-detail">
                        <i className="fa-regular fa-clock"></i> {item.offer.internshipDuration}
                    </span>
                )}
                {item.offer.salary && (
                    <span className="popup-detail">
                        <i className="fa-solid fa-euro-sign"></i> {item.offer.salary}
                    </span>
                )}
            </div>
            {item.offer.tags && item.offer.tags.length > 0 && (
                <div className="popup-tags">
                    {item.offer.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="popup-tag">{tag}</span>
                    ))}
                    {item.offer.tags.length > 3 && (
                        <span className="popup-tag-more">+{item.offer.tags.length - 3}</span>
                    )}
                </div>
            )}
        </div>
        <div className="popup-arrow">
            <i className="fa-solid fa-chevron-right"></i>
        </div>
    </div>
);

const GroupModal: React.FC<{
    group: LocationGroup;
    onOfferClick: (offer: OfferDto) => void;
    onClose: () => void;
}> = ({ group, onOfferClick, onClose }) => (
    <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal" onClick={e => e.stopPropagation()}>
            <div className="group-modal-header">
                <div>
                    <p className="group-location">
                        <i className="fa-solid fa-location-dot"></i> {group.city}
                    </p>
                    <span className="group-offer-count">
                        {group.items.length} offre{group.items.length > 1 ? 's' : ''}
                    </span>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            <div className="group-offers-list">
                {group.items.map(item => (
                    <OfferCard
                        key={item.offer.id}
                        item={item}
                        onClick={() => { onOfferClick(item.offer); onClose(); }}
                    />
                ))}
            </div>
        </div>
    </div>
);

const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334];

const OffersMap: React.FC<OffersMapProps> = ({
                                                 offers,
                                                 companyNames,
                                                 companyCities,
                                                 companyAddresses,
                                                 companyPostalCodes,
                                                 onOfferClick,
                                             }) => {
    const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError('');

            try {
                const input = offers.map(offer => ({
                    id: offer.id,
                    address: companyAddresses[offer.companyId],
                    city: companyCities[offer.companyId],
                    postalCode: companyPostalCodes[offer.companyId],
                }));

                const results = await GeocodingService.geocodeBatch(input);
                if (cancelled) return;

                const groups = buildLocationGroups(offers, results, companyNames, companyCities);
                setLocationGroups(groups);

                if (groups.length === 0) {
                    setError('Aucune offre n\'a pu être géolocalisée. Vérifiez les adresses.');
                }
            } catch {
                if (!cancelled) setError('Erreur lors de la géolocalisation des offres.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void run();
        return () => { cancelled = true; };
    }, [offers, companyAddresses, companyCities, companyPostalCodes, companyNames]);


    if (loading) {
        return (
            <div className="map-container loading">
                <div className="map-loading-spinner">
                    <div className="spinner"></div>
                    <p>Géolocalisation des offres en cours…</p>
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

    const totalOffers = locationGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="map-container">
            <MapContainer center={DEFAULT_CENTER} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {locationGroups.map(group => (
                    <Marker
                        key={group.key}
                        position={[group.coordinates.lat, group.coordinates.lon]}
                        icon={createMarkerIcon(group.items.length)}
                        eventHandlers={{ click: () => setSelectedGroup(group) }}
                    />
                ))}

                <MapBoundsUpdater groups={locationGroups} />
            </MapContainer>

            <div className="map-info-badge">
                <i className="fa-solid fa-map-pin"></i>
                {totalOffers} offre{totalOffers > 1 ? 's' : ''} sur {locationGroups.length} emplacement{locationGroups.length > 1 ? 's' : ''}
            </div>

            {selectedGroup && (
                <GroupModal group={selectedGroup} onOfferClick={onOfferClick} onClose={() => setSelectedGroup(null)} />
            )}
        </div>
    );
};

export default OffersMap;