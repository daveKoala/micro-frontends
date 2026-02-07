// Booking service client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('Booking service loaded');

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.3s';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });

  // Form validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!valid) {
        e.preventDefault();
        alert('Please fill in all required fields');
      }
    });
  });

  // Date picker - set min date to today
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    if (!input.value) {
      const today = new Date().toISOString().split('T')[0];
      input.setAttribute('min', today);
    }
  });
});

// Cross-microsite communication via BroadcastChannel
const channel = new BroadcastChannel('micro-frontend');

channel.onmessage = function(event) {
  console.log('Received message from another microsite:', event.data);

  if (event.data.type === 'user:updated') {
    // Handle user update event
    console.log('User updated:', event.data.user);
  }
};

// Helper to broadcast events
function broadcastEvent(type, data) {
  channel.postMessage({ type, ...data, source: 'booking' });
}
