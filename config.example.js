// Configuration Example
// COPY this file to config.js and update with your actual values

const CONFIG = {
    // Supabase Configuration
    // Get these from your Supabase project: Settings → API
    supabase: {
        url: 'https://your-project-id.supabase.co',
        anonKey: 'your-anon-key-here'
    },

    // Trip Information
    trip: {
        name: 'Peru 2026 - Luz de Esperanza',
        destination: 'Ahuac, Peru',
        departureDate: '2026-06-26', // YYYY-MM-DD format
        returnDate: '2026-07-05',     // YYYY-MM-DD format
        description: 'A life-changing volunteer trip to serve at Luz de Esperanza school in the Peruvian Andes.',
        
        // Location details
        locations: {
            primary: {
                name: 'Ahuac',
                country: 'Peru',
                altitude: '10,692 ft',
                coordinates: { lat: -12.0464, lng: -75.2137 }
            },
            secondary: [
                {
                    name: 'Huancayo',
                    altitude: '10,692 ft',
                    coordinates: { lat: -12.0608, lng: -75.2049 }
                },
                {
                    name: 'Cusco',
                    altitude: '11,152 ft',
                    coordinates: { lat: -13.5319, lng: -71.9675 }
                }
            ]
        }
    },

    // Organization Information
    organization: {
        name: 'First Baptist Church',
        logo: '/assets/church-logo.png',
        contactEmail: 'tripcoordinator@church.org',
        contactPhone: '(555) 123-4567'
    },

    // Payment Configuration
    payment: {
        totalCost: 2500.00,
        depositAmount: 500.00,
        depositDeadline: '2025-12-01',
        finalDeadline: '2026-05-01',
        currency: 'USD'
    },

    // Branding/Theme
    theme: {
        primaryColor: '#c62828',
        secondaryColor: '#d84315',
        accentColor: '#ff6f00',
        logo: '/assets/logo.png'
    },

    // Feature Flags (enable/disable features)
    features: {
        enablePayments: true,
        enableDocumentUploads: true,
        enableTripMemories: true,
        enablePublicCalendar: true,
        enablePublicResources: true
    },

    // Google Maps API (optional - for maps)
    googleMapsApiKey: 'your-google-maps-api-key' // Get from Google Cloud Console
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
