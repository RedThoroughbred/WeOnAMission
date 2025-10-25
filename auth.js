// Authentication Helper
// Handles authentication state, redirects, and user session

const Auth = {
    // Check if user is logged in
    async isAuthenticated() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user !== null;
    },

    // Get current user with role
    async getCurrentUser() {
        try {
            return await API.getCurrentUser();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Require authentication (redirect to login if not authenticated)
    async requireAuth() {
        const isAuth = await this.isAuthenticated();
        if (!isAuth) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Require specific role
    async requireRole(requiredRole) {
        const user = await this.getCurrentUser();
        if (!user || user.role !== requiredRole) {
            alert('You do not have permission to access this page.');
            this.redirectToPortal(user ? user.role : 'parent');
            return false;
        }
        return true;
    },

    // Require admin role (convenience method)
    async requireAdmin() {
        return await this.requireRole('admin');
    },

    // Redirect to appropriate portal based on role
    redirectToPortal(role) {
        const portals = {
            'parent': '/parent-portal.html',
            'student': '/student-portal.html',
            'admin': '/admin-portal.html'
        };
        window.location.href = portals[role] || '/parent-portal.html';
    },

    // Initialize authentication state for a page
    async initializePage(requiredRole = null) {
        // Check if user is authenticated
        const isAuth = await this.requireAuth();
        if (!isAuth) return null;

        // Get current user
        const user = await this.getCurrentUser();
        if (!user) {
            await this.signOut();
            return null;
        }

        // Check role if required
        if (requiredRole && user.role !== requiredRole) {
            alert('You do not have permission to access this page.');
            this.redirectToPortal(user.role);
            return null;
        }

        // Setup logout button if it exists
        this.setupLogoutButton();

        // Display user info if element exists
        this.displayUserInfo(user);

        return user;
    },

    // Setup logout button
    setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.signOut();
            });
        }
    },

    // Display user info in header
    displayUserInfo(user) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.full_name || user.email;
        }

        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = user.email;
        }

        const userRoleEl = document.getElementById('userRole');
        if (userRoleEl) {
            userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
    },

    // Sign out
    async signOut() {
        try {
            await API.signOut();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    },

    // Listen for auth state changes
    onAuthStateChange(callback) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    },

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format datetime for display
    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: CONFIG.payment.currency || 'USD'
        }).format(amount);
    },

    // Show loading state
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    },

    // Show error message
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="error-message">${message}</div>`;
        }
    },

    // Show success message
    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="success-message">${message}</div>`;
        }
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password (minimum 6 characters)
    isValidPassword(password) {
        return password.length >= 6;
    },

    // Get file size in human-readable format
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Get event type color
    getEventTypeColor(eventType) {
        const colors = {
            'meeting': '#2196F3',
            'deadline': '#F44336',
            'activity': '#4CAF50',
            'preparation': '#FF9800',
            'travel': '#9C27B0',
            'fundraiser': '#E91E63',
            'other': '#9E9E9E'
        };
        return colors[eventType] || colors.other;
    },

    // Get resource type color
    getResourceTypeColor(resourceType) {
        const colors = {
            'document': '#2196F3',
            'video': '#F44336',
            'website': '#4CAF50',
            'form': '#FF9800',
            'guide': '#9C27B0',
            'other': '#9E9E9E'
        };
        return colors[resourceType] || colors.other;
    },

    // Get status badge color
    getStatusColor(status) {
        const colors = {
            'pending': '#FF9800',
            'approved': '#4CAF50',
            'rejected': '#F44336',
            'paid': '#4CAF50',
            'partial': '#FF9800'
        };
        return colors[status] || '#9E9E9E';
    },

    // Debounce function (useful for search)
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
