// Theme Management - Handles color schemes and theming
// Supports 5 pre-built professional themes + Dark/Light mode

const Theme = {
    // Initialize theme on page load
    init() {
        // Get color theme from config
        let colorTheme = CONFIG.theme || 'neutral';

        // Get dark/light mode preference from localStorage
        const savedMode = localStorage.getItem('themeMode');
        let mode = savedMode || 'light';

        // Check system preference if no saved preference
        if (!savedMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            mode = 'dark';
        }

        this.applyColorTheme(colorTheme);
        this.setMode(mode, false); // Don't save on init
    },

    // Apply color theme colors to page
    applyColorTheme(themeName) {
        const theme = CONFIG.themes[themeName];

        if (!theme) {
            console.warn(`Theme "${themeName}" not found, using neutral`);
            return this.applyColorTheme('neutral');
        }

        // Set CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--primary-light', theme.primaryLight);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--secondary-dark', theme.secondaryDark);
        root.style.setProperty('--secondary-light', theme.secondaryLight);

        // Store in sessionStorage for consistency
        sessionStorage.setItem('currentTheme', themeName);
    },

    // Set dark/light mode
    setMode(mode, shouldSave = true) {
        const html = document.documentElement;

        if (mode === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }

        if (shouldSave) {
            localStorage.setItem('themeMode', mode);
        }

        // Update theme toggle button if it exists
        this.updateThemeButton(mode);
    },

    // Toggle between light and dark mode
    toggleMode() {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newMode = isDark ? 'light' : 'dark';
        this.setMode(newMode, true);
    },

    // Get current mode
    getMode() {
        const html = document.documentElement;
        return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    },

    // Update theme button appearance
    updateThemeButton(mode) {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        if (mode === 'dark') {
            btn.innerHTML = '☀️';
            btn.title = 'Switch to Light Mode';
        } else {
            btn.innerHTML = '🌙';
            btn.title = 'Switch to Dark Mode';
        }
    },

    // Get all available color themes (for admin theme selector)
    getAvailableThemes() {
        return Object.entries(CONFIG.themes).map(([key, theme]) => ({
            id: key,
            name: theme.name,
            primary: theme.primary
        }));
    },

    // Get current color theme
    getCurrentTheme() {
        return sessionStorage.getItem('currentTheme') || CONFIG.theme || 'neutral';
    },

    // Change color theme (for future admin settings)
    setTheme(themeName) {
        if (CONFIG.themes[themeName]) {
            this.applyColorTheme(themeName);
        }
    }
};


// Setup theme button click handler
function setupThemeButton() {
    const setupBtn = function() {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn && !themeBtn.dataset.themeListenerAttached) {
            themeBtn.addEventListener('click', function() {
                Theme.toggleMode();
            });
            themeBtn.dataset.themeListenerAttached = 'true';
        }
    };

    // Try immediately
    setupBtn();

    // Also try on DOMContentLoaded in case it hasn't fired yet
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBtn);
    }
}

// Initialize theme when DOM and CONFIG are ready
function initializeTheme() {
    if (typeof CONFIG !== 'undefined' && CONFIG.themes) {
        Theme.init();
        setupThemeButton();
        console.log('Theme initialized. Current mode:', Theme.getMode());
    } else {
        // Retry if CONFIG not ready
        setTimeout(initializeTheme, 50);
    }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    // DOM is already ready
    initializeTheme();
}
