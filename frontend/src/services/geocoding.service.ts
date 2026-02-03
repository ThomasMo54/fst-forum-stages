
export interface GeocodingResult {
    lat: number;
    lon: number;
    displayName: string;
}

class GeocodingService {
    private readonly baseURL = 'https://nominatim.openstreetmap.org';
    private readonly cache = new Map<string, GeocodingResult | null>();
    private readonly requestQueue: Array<() => Promise<void>> = [];
    private isProcessing = false;

    /**
     * Geocode an address with rate limiting and caching
     * @param address - Full address string
     * @param city - City name
     * @param postalCode - Postal code
     * @returns Coordinates or null if not found
     */
    async geocodeAddress(
        address?: string,
        city?: string,
        postalCode?: string
    ): Promise<GeocodingResult | null> {
        // Build search query
        const query = this.buildQuery(address, city, postalCode);
        if (!query) return null;

        // Check cache
        const cached = this.cache.get(query);
        if (cached !== undefined) return cached;

        // Queue the request to respect rate limits (1 req/sec for Nominatim)
        return new Promise((resolve) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await this.fetchGeocode(query);
                    this.cache.set(query, result);
                    resolve(result);
                } catch (error) {
                    console.error(`Geocoding failed for "${query}":`, error);
                    this.cache.set(query, null);
                    resolve(null);
                }
            });

            this.processQueue();
        });
    }

    /**
     * Build search query from address components
     */
    private buildQuery(
        address?: string,
        city?: string,
        postalCode?: string
    ): string {
        const parts: string[] = [];

        if (address?.trim()) parts.push(address.trim());
        if (postalCode?.trim()) parts.push(postalCode.trim());
        if (city?.trim()) parts.push(city.trim());
        parts.push('France');

        return parts.join(', ');
    }

    /**
     * Fetch coordinates from Nominatim API
     */
    private async fetchGeocode(query: string): Promise<GeocodingResult | null> {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '1',
            countrycodes: 'fr', // Restrict to France
            addressdetails: '1'
        });

        const response = await fetch(`${this.baseURL}/search?${params}`, {
            headers: {
                'User-Agent': 'InternshipPlatform/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        const result = data[0];
        return {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            displayName: result.display_name
        };
    }

    /**
     * Process geocoding queue with rate limiting
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.requestQueue.length === 0) return;

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const task = this.requestQueue.shift();
            if (task) {
                await task();
                // Wait 1 second between requests (Nominatim rate limit)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.isProcessing = false;
    }

    /**
     * Batch geocode multiple addresses
     */
    async geocodeBatch(
        addresses: Array<{
            id: string;
            address?: string;
            city?: string;
            postalCode?: string;
        }>
    ): Promise<Map<string, GeocodingResult | null>> {
        const results = new Map<string, GeocodingResult | null>();

        // Process sequentially to respect rate limits
        for (const item of addresses) {
            const result = await this.geocodeAddress(
                item.address,
                item.city,
                item.postalCode
            );
            results.set(item.id, result);
        }

        return results;
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

export default new GeocodingService();