export interface GeocodingResult {
    lat: number;
    lon: number;
    displayName: string;
}

interface AddressInput {
    id: string;
    address?: string;
    city?: string;
    postalCode?: string;
}

/**
 * GeocodingService
 * - Geocode via Nominatim with rate limiting (1 req/sec)
 * - Cache results to avoid redundant API calls
 * - Fallback strategy: full address → city only → null
 */
class GeocodingService {
    private readonly baseURL = 'https://nominatim.openstreetmap.org';
    private readonly cache = new Map<string, GeocodingResult | null>();
    private lastRequestTime = 0;

    /**
     * Geocode a single address with automatic fallback.
     * Tries: "address, postalCode, city, France" → "city, France" → null
     */
    async geocodeAddress(
        address?: string,
        city?: string,
        postalCode?: string
    ): Promise<GeocodingResult | null> {
        const fullQuery = this.buildQuery(address, postalCode, city);
        if (!fullQuery) return null;

        // Try full address first
        const fullResult = await this.cachedFetch(fullQuery);
        if (fullResult) return fullResult;

        // Fallback: city only (if we had more than just the city in the first attempt)
        const cityOnlyQuery = this.buildCityOnlyQuery(city);
        if (cityOnlyQuery && cityOnlyQuery !== fullQuery) {
            return await this.cachedFetch(cityOnlyQuery);
        }

        return null;
    }

    /**
     * Batch geocode multiple addresses sequentially (respects rate limits).
     */
    async geocodeBatch(addresses: AddressInput[]): Promise<Map<string, GeocodingResult | null>> {
        const results = new Map<string, GeocodingResult | null>();

        for (const item of addresses) {
            const result = await this.geocodeAddress(item.address, item.city, item.postalCode);
            results.set(item.id, result);
        }

        return results;
    }

    /** Clear the internal cache. */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Full query: address + postalCode + city + France
     */
    private buildQuery(address?: string, postalCode?: string, city?: string): string | null {
        const parts: string[] = [];

        if (address?.trim())    parts.push(address.trim());
        if (postalCode?.trim()) parts.push(postalCode.trim());
        if (city?.trim())       parts.push(city.trim());

        if (parts.length === 0) return null;

        parts.push('France');
        return parts.join(', ');
    }

    /**
     * City-only fallback query: city + France
     */
    private buildCityOnlyQuery(city?: string): string | null {
        if (!city?.trim()) return null;
        return `${city.trim()}, France`;
    }

    /**
     * Returns cached result if available, otherwise fetches & caches.
     */
    private async cachedFetch(query: string): Promise<GeocodingResult | null> {
        if (this.cache.has(query)) return this.cache.get(query) ?? null;

        const result = await this.rateLimitedFetch(query);
        this.cache.set(query, result);
        return result;
    }

    /**
     * Enforces Nominatim's 1 request/second rate limit.
     */
    private async rateLimitedFetch(query: string): Promise<GeocodingResult | null> {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;

        if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
        }

        this.lastRequestTime = Date.now();
        return await this.fetchGeocode(query);
    }

    /**
     * Calls Nominatim search endpoint.
     */
    private async fetchGeocode(query: string): Promise<GeocodingResult | null> {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '1',
            countrycodes: 'fr',
        });

        const response = await fetch(`${this.baseURL}/search?${params}`, {
            headers: { 'User-Agent': 'InternshipPlatform/1.0' },
        });

        if (!response.ok) {
            console.error(`Nominatim error: ${response.status} for "${query}"`);
            return null;
        }

        const data = await response.json();
        if (!data?.length) return null;

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            displayName: data[0].display_name,
        };
    }
}

export default new GeocodingService();