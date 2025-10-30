// Configuration File
// Multi-tenant aware configuration for WeOnAMission

const CONFIG = {
    // Supabase Configuration (shared across all churches)
    supabase: {
        url: 'https://sqcdgvvjojgrwsdajtuq.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2RndnZqb2pncndzZGFqdHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk0ODQsImV4cCI6MjA3NjgzNTQ4NH0.pox-fMugQZAd7JClZSbuKp9U56EkEWr6yyTGdoOUCH4'
    },

    // Default Trip Information (overridden by church settings from database)
    trip: {
        name: 'Mission Trip',
        destination: 'TBD',
        departureDate: '2026-06-26',
        returnDate: '2026-07-05',
        description: 'A life-changing volunteer trip.',
        locations: {
            primary: {
                name: 'Trip Location',
                country: 'TBD',
                altitude: 'TBD',
                coordinates: { lat: 0, lng: 0 }
            },
            secondary: []
        }
    },

    // Default Organization Information (overridden by church settings from database)
    organization: {
        name: 'Church Name',
        logo: '/assets/logo.png',
        contactEmail: 'info@example.com',
        contactPhone: '(555) 000-0000'
    },

    // Default Payment Configuration (overridden by church settings from database)
    payment: {
        totalCost: 2500.00,
        depositAmount: 500.00,
        depositDeadline: '2025-12-01',
        finalDeadline: '2026-05-01',
        currency: 'USD'
    },

    // Branding/Theme - Choose from pre-built themes or customize
    // Available themes: 'ocean', 'forest', 'sunset', 'lavender', 'neutral'
    theme: 'ocean',

    // Pre-built theme packages (don't modify)
    themes: {
        ocean: {
            name: 'Ocean',
            primary: '#0369A1',
            primaryDark: '#0284C7',
            primaryLight: '#38BDF8',
            secondary: '#06B6D4',
            secondaryDark: '#0891B2',
            secondaryLight: '#22D3EE'
        },
        forest: {
            name: 'Forest',
            primary: '#15803D',
            primaryDark: '#166534',
            primaryLight: '#22C55E',
            secondary: '#10B981',
            secondaryDark: '#059669',
            secondaryLight: '#34D399'
        },
        sunset: {
            name: 'Sunset',
            primary: '#EA580C',
            primaryDark: '#C2410C',
            primaryLight: '#F97316',
            secondary: '#F97316',
            secondaryDark: '#EA580C',
            secondaryLight: '#FED7AA'
        },
        lavender: {
            name: 'Lavender',
            primary: '#A855F7',
            primaryDark: '#9333EA',
            primaryLight: '#D8B4FE',
            secondary: '#EC4899',
            secondaryDark: '#DB2777',
            secondaryLight: '#F472B6'
        },
        neutral: {
            name: 'Neutral',
            primary: '#4F46E5',
            primaryDark: '#4338CA',
            primaryLight: '#818CF8',
            secondary: '#06B6D4',
            secondaryDark: '#0891B2',
            secondaryLight: '#22D3EE'
        }
    },

    // Feature Flags (same across all churches for now)
    features: {
        enablePayments: true,
        enableDocumentUploads: true,
        enableTripMemories: true,
        enablePublicCalendar: true,
        enablePublicResources: true,
        enableQuestions: true,
        enableContentManagement: true
    },

    // Google Maps API (optional)
    googleMapsApiKey: 'demo-key',

    // Multi-Tenant Configuration
    multiTenant: {
        enabled: true,
        // Church-specific settings loaded at runtime from database
        churchSettings: {}
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
