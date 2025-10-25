// Tenant/Church Context Management
// Handles detecting which church is being accessed and managing church context

const TRINITY_CHURCH_ID = '00000000-0000-0000-0000-000000000001';

const Tenant = {
    // ==================== CHURCH DETECTION ====================

    /**
     * Get the church slug from the URL
     * Supports both:
     * - Subdirectory: weonamission.org/trinity/parent-portal -> "trinity"
     * - Query param: localhost:8000/parent-portal.html?church=trinity -> "trinity"
     *
     * Priority: Query param > URL path > localStorage
     */
    getChurchSlugFromUrl() {
        // Check query parameter first (highest priority)
        const params = new URLSearchParams(window.location.search);
        const queryChurch = params.get('church');
        if (queryChurch) {
            // Store in localStorage for convenience
            localStorage.setItem('selectedChurch', queryChurch);
            return queryChurch;
        }

        // Check localStorage (for persistence across page navigation)
        const storedChurch = localStorage.getItem('selectedChurch');
        if (storedChurch) {
            return storedChurch;
        }

        // Check URL path (for future subdirectory support)
        const pathname = window.location.pathname;
        const parts = pathname.split('/').filter(p => p.length > 0);

        if (parts.length === 0 || parts[0].endsWith('.html')) {
            return null;
        }

        const firstPart = parts[0];
        const knownRoutes = ['api', 'assets', 'admin', 'dashboard'];

        if (knownRoutes.includes(firstPart)) {
            return null;
        }

        return firstPart;
    },

    /**
     * Get the church ID from the slug
     * Fetches from database with fallback to hardcoded Trinity
     */
    async getChurchIdFromSlug(slug) {
        if (!slug) return null;

        // First try to fetch from database
        try {
            const { data } = await supabaseClient
                .from('churches')
                .select('id')
                .eq('slug', slug)
                .single();

            if (data && data.id) {
                return data.id;
            }
        } catch (error) {
            console.warn(`Church not found in database for slug: ${slug}`, error);
        }

        // Fallback to hardcoded Trinity for backward compatibility
        if (slug === 'trinity' || slug === 'trinitychurch') {
            return TRINITY_CHURCH_ID;
        }

        return null;
    },

    /**
     * Get the current church context
     * Returns { slug, id, name } or null if on landing page
     */
    async getCurrentChurchContext() {
        const slug = this.getChurchSlugFromUrl();

        if (!slug) {
            return null;
        }

        const id = await this.getChurchIdFromSlug(slug);

        if (!id) {
            return null;
        }

        // Try to fetch church name from database
        let churchName = 'Mission Trip';
        try {
            const { data } = await supabaseClient
                .from('churches')
                .select('name')
                .eq('id', id)
                .single();

            if (data && data.name) {
                churchName = data.name;
            }
        } catch (error) {
            // Use default name if fetch fails
            const defaultNames = {
                'trinity': 'Trinity Church',
                'trinitychurch': 'Trinity Church',
            };
            churchName = defaultNames[slug] || 'Mission Trip';
        }

        return {
            slug,
            id,
            name: churchName
        };
    },

    /**
     * Check if we're on a church-specific page
     */
    isChurchPage() {
        return this.getChurchSlugFromUrl() !== null;
    },

    /**
     * Redirect user to their church home page
     */
    async redirectToChurch(churchSlug = 'trinity') {
        window.location.href = `/${churchSlug}/`;
    },

    /**
     * Get the base URL for a church
     */
    getChurchBaseUrl(churchSlug = 'trinity') {
        const protocol = window.location.protocol;
        const host = window.location.host;
        return `${protocol}//${host}/${churchSlug}`;
    },

    /**
     * Build a full URL for a page within a church
     */
    getChurchPageUrl(path, churchSlug = 'trinity') {
        const base = this.getChurchBaseUrl(churchSlug);
        // Remove leading slash from path if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${base}/${cleanPath}`;
    },

    // ==================== LOGGING/DEBUG ====================

    /**
     * Log current tenant context (useful for debugging)
     */
    logContext() {
        const slug = this.getChurchSlugFromUrl();
        console.log('🏛️ Tenant Context:', {
            slug,
            isChurchPage: this.isChurchPage(),
            url: window.location.href,
            pathname: window.location.pathname
        });
    }
};

// Log context on every page load for debugging
document.addEventListener('DOMContentLoaded', () => {
    Tenant.logContext();
});
