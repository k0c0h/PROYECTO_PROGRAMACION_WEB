console.log('[Contact] Script loaded');

window.initContact = function () {
    console.log('[Contact] initContact called, initializing contact form');

    // Get DOM elements
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('edad');
    const emailInput = document.getElementById('correo');
    const messageTextarea = document.getElementById('mensaje');
    const locationConsent = document.getElementById('locationConsent');

    // Check if required elements exist
    console.log('[Contact] Form elements found:', {
        contactForm: !!contactForm,
        nameInput: !!nameInput,
        ageInput: !!ageInput,
        emailInput: !!emailInput,
        messageTextarea: !!messageTextarea,
        locationConsent: !!locationConsent
    });

    if (!contactForm || !nameInput || !ageInput || !emailInput || !messageTextarea || !locationConsent) {
        console.error('[Contact] Error: One or more form elements not found');
        return;
    }

    // Current user coordinates
    let userCoordinates = null;

    // Get user coordinates when page loads
    getUserLocation();

    function getUserLocation() {
        console.log('[Contact] Getting user location...');
        
        if ("geolocation" in navigator) {
            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000 // 5 minutes
            };

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    userCoordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('[Contact] User coordinates obtained:', userCoordinates);
                },
                function(error) {
                    console.warn('[Contact] Error getting location:', error.message);
                    userCoordinates = null;
                },
                options
            );
        } else {
            console.warn('[Contact] Geolocation not supported');
            userCoordinates = null;
        }
    }

    // Form validation
    function validateForm() {
        const errors = [];

        if (!nameInput.value.trim()) {
            errors.push('El nombre es requerido');
        } else if (nameInput.value.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        const age = parseInt(ageInput.value);
        if (!age || age < 10 || age > 65) {
            errors.push('La edad debe estar entre 10 y 65 años');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            errors.push('El email es requerido');
        } else if (!emailRegex.test(emailInput.value.trim())) {
            errors.push('El formato del email no es válido');
        }

        if (!messageTextarea.value.trim()) {
            errors.push('El mensaje es requerido');
        } else if (messageTextarea.value.trim().length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
        }

        return errors;
    }

    // Show form errors
    function showErrors(errors) {
        // Remove existing error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger error-message mt-2';
            errorDiv.textContent = error;
            contactForm.appendChild(errorDiv);
        });

        // Scroll to first error
        const firstError = document.querySelector('.error-message');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Show success message
    function showSuccess() {
        // Remove existing messages
        document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());

        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success success-message mt-2';
        successDiv.innerHTML = `
            <i class="fa fa-check-circle me-2"></i>
            <strong>¡Mensaje enviado exitosamente!</strong>
            <p class="mb-0 mt-2">Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos pronto.</p>
        `;
        contactForm.appendChild(successDiv);

        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Clear form
        contactForm.reset();

        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // Generate unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Save comment to localStorage
    function saveComment(commentData) {
        try {
            let comments = JSON.parse(localStorage.getItem('comments')) || [];
            console.log('[Contact] Current comments in localStorage:', comments.length);
            
            const newComment = {
                id: generateId(),
                name: commentData.name,
                age: commentData.age,
                email: commentData.email,
                message: commentData.message,
                coordinates: commentData.coordinates,
                timestamp: new Date().toISOString()
            };

            comments.unshift(newComment); // Add to beginning of array
            localStorage.setItem('comments', JSON.stringify(comments));
            
            console.log('[Contact] Comment saved successfully:', newComment);
            console.log('[Contact] Total comments now:', comments.length);
            return newComment;
        } catch (error) {
            console.error('[Contact] Error saving comment to localStorage:', error);
            throw error;
        }
    }

    // Handle form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('[Contact] Form submitted');

        // Validate form
        const errors = validateForm();
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        // Prepare comment data
        const commentData = {
            name: nameInput.value.trim(),
            age: parseInt(ageInput.value),
            email: emailInput.value.trim(),
            message: messageTextarea.value.trim(),
            coordinates: locationConsent.checked ? userCoordinates : null
        };

        // Save comment
        try {
            const savedComment = saveComment(commentData);
            
            // Show success message
            showSuccess();
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Mensaje enviado', { 
                    body: `Hola ${commentData.name}, hemos recibido tu mensaje.`,
                    icon: './public/img/icon.png'
                });
            }

            // Log success
            console.log('[Contact] Message sent successfully:', savedComment);

        } catch (error) {
            console.error('[Contact] Error saving comment:', error);
            showErrors(['Error al enviar el mensaje. Por favor, inténtalo de nuevo.']);
        }
    });

    // Real-time validation feedback
    nameInput.addEventListener('blur', function() {
        if (this.value.trim().length > 0 && this.value.trim().length < 2) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });

    ageInput.addEventListener('blur', function() {
        const age = parseInt(this.value);
        if (this.value && (age < 10 || age > 65)) {
            this.classList.add('is-invalid');
        } else if (this.value) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });

    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value.trim() && !emailRegex.test(this.value.trim())) {
            this.classList.add('is-invalid');
        } else if (this.value.trim()) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });

    messageTextarea.addEventListener('blur', function() {
        if (this.value.trim().length > 0 && this.value.trim().length < 10) {
            this.classList.add('is-invalid');
        } else if (this.value.trim()) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });

    // Character counter for message
    const messageCounter = document.createElement('small');
    messageCounter.className = 'form-text text-muted';
    messageTextarea.parentNode.appendChild(messageCounter);

    messageTextarea.addEventListener('input', function() {
        const remaining = 500 - this.value.length;
        if (remaining < 0) {
            messageCounter.textContent = `${Math.abs(remaining)} caracteres de más`;
            messageCounter.className = 'form-text text-danger';
            this.value = this.value.substring(0, 500);
        } else {
            messageCounter.textContent = `${this.value.length}/500 caracteres`;
            messageCounter.className = 'form-text text-muted';
        }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('[Contact] Notification permission:', permission);
        });
    }

    console.log('[Contact] Contact form initialized successfully');
};

// Auto-initialize if contact form exists
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to be fully loaded by SPA
    setTimeout(() => {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            console.log('[Contact] Auto-initializing contact form');
            initContact();
        } else {
            console.log('[Contact] Contact form not found during auto-initialization');
        }
    }, 500);
});
