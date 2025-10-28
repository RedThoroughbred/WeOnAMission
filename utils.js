// Utility functions - Notifications, validation, and helpers

const Notify = {
    // Show toast notification
    toast(message, type = 'info', duration = 3000) {
        // Ensure container exists
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icons for different types
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.remove();
        }, duration);

        return toast;
    },

    success(message, duration = 3000) {
        return this.toast(message, 'success', duration);
    },

    error(message, duration = 4000) {
        return this.toast(message, 'error', duration);
    },

    warning(message, duration = 3500) {
        return this.toast(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        return this.toast(message, 'info', duration);
    }
};

// Form validation helper
const Form = {
    // Validate email format
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validate required field
    isRequired(value) {
        return value && value.trim().length > 0;
    },

    // Validate minimum length
    minLength(value, min) {
        return value.length >= min;
    },

    // Validate maximum length
    maxLength(value, max) {
        return value.length <= max;
    },

    // Validate number
    isNumber(value) {
        return !isNaN(value) && value !== '';
    },

    // Validate positive number
    isPositive(value) {
        return this.isNumber(value) && parseFloat(value) > 0;
    },

    // Show validation error on field
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
        }

        // Find or create error message element
        let errorMsg = formGroup?.querySelector('.form-error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'form-error-message';
            field.parentElement.appendChild(errorMsg);
        }

        errorMsg.textContent = message;
        errorMsg.classList.add('show');
    },

    // Clear validation error from field
    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
        }

        const errorMsg = formGroup?.querySelector('.form-error-message');
        if (errorMsg) {
            errorMsg.classList.remove('show');
            errorMsg.textContent = '';
        }
    },

    // Clear all errors in form
    clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.form-error-message');
            if (errorMsg) {
                errorMsg.classList.remove('show');
            }
        });
    }
};

// Button loading state helper
const Button = {
    // Show loading state
    setLoading(buttonId, isLoading = true) {
        const btn = typeof buttonId === 'string' ? document.getElementById(buttonId) : buttonId;
        if (!btn) return;

        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
        }
    },

    // Toggle loading state
    toggleLoading(buttonId) {
        const btn = typeof buttonId === 'string' ? document.getElementById(buttonId) : buttonId;
        if (!btn) return;

        const isLoading = btn.classList.contains('loading');
        this.setLoading(btn, !isLoading);
    }
};

// Empty state helper
const EmptyState = {
    // Show empty state
    show(containerId, options = {}) {
        const {
            icon = '📭',
            title = 'No data',
            message = 'Nothing to show yet',
            buttonText = null,
            buttonAction = null
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        let buttonHtml = '';
        if (buttonText && buttonAction) {
            buttonHtml = `<button class="btn" onclick="${buttonAction}">${buttonText}</button>`;
        }

        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">${icon}</span>
                <h3>${title}</h3>
                <p>${message}</p>
                ${buttonHtml}
            </div>
        `;
    },

    // Hide empty state
    hide(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
    }
};

// API error handling helper
const ErrorHandler = {
    // Parse Supabase errors and show user-friendly messages
    handleError(error, context = '') {
        console.error(`Error ${context}:`, error);

        let message = 'Something went wrong. Please try again.';

        if (error.message) {
            // Supabase specific errors
            if (error.message.includes('duplicate')) {
                message = 'This item already exists';
            } else if (error.message.includes('not found')) {
                message = 'Item not found';
            } else if (error.message.includes('permission')) {
                message = 'You do not have permission to do this';
            } else if (error.message.includes('invalid')) {
                message = 'Invalid input. Please check your entries.';
            } else {
                message = error.message;
            }
        }

        Notify.error(message);
        return message;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Notify, Form, Button, EmptyState, ErrorHandler };
}
