// Catalogue service client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Catalogue service loaded');

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#d1d5db';
                }
            });

            // Validate price is positive
            const priceField = form.querySelector('#price');
            if (priceField && parseFloat(priceField.value) <= 0) {
                valid = false;
                priceField.style.borderColor = '#dc2626';
                alert('Price must be greater than 0');
            }

            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields correctly');
            }
        });
    });

    // Image preview
    const imageInput = document.querySelector('#image');
    if (imageInput) {
        imageInput.addEventListener('blur', function() {
            const url = this.value;
            if (url) {
                // Could add image preview here
                console.log('Image URL:', url);
            }
        });
    }
});

// Cross-microsite communication via shared EventBus
const eventBus = window.eventBus;
const EventTypes = window.EventTypes || {};

if (eventBus && EventTypes.USER_UPDATED) {
    eventBus.on(EventTypes.USER_UPDATED, (payload, source) => {
        console.log('Received user update from', source, payload);
    });
}

if (eventBus && EventTypes.BOOKING_CREATED) {
    eventBus.on(EventTypes.BOOKING_CREATED, (payload, source) => {
        console.log('New booking created from', source, payload);
    });
}

// Helper to broadcast events
function broadcastEvent(type, data) {
    if (!eventBus) return;
    eventBus.emit(type, data);
}

// Example: Broadcast when adding to cart (if we had cart functionality)
function addToCart(productId) {
    broadcastEvent('cart:updated', { productId, action: 'add' });
}
