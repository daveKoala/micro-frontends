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

// Cross-microsite communication via BroadcastChannel
const channel = new BroadcastChannel('micro-frontend');

channel.onmessage = function(event) {
    console.log('Received message from another microsite:', event.data);

    if (event.data.type === 'user:updated') {
        // Handle user update event
        console.log('User updated:', event.data.user);
    }

    if (event.data.type === 'booking:created') {
        // Could show notification about new booking
        console.log('New booking created:', event.data);
    }
};

// Helper to broadcast events
function broadcastEvent(type, data) {
    channel.postMessage({ type, ...data, source: 'catalogue' });
}

// Example: Broadcast when adding to cart (if we had cart functionality)
function addToCart(productId) {
    broadcastEvent('cart:updated', { productId, action: 'add' });
}
