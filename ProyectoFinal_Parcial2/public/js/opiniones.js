console.log('[Opiniones] Script loaded');

window.initOpiniones = function () {
    console.log('[Opiniones] initOpiniones called, initializing comments management');

    // Get comments from localStorage
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    console.log('[Opiniones] Comments loaded:', comments);

    // Get DOM elements
    const commentsTableBody = document.getElementById('commentsTableBody');
    const noCommentsMessage = document.getElementById('noCommentsMessage');
    const commentsError = document.getElementById('commentsError');
    const clearAllCommentsButton = document.getElementById('clearAllComments');
    const searchNameInput = document.getElementById('searchName');
    const filterDateInput = document.getElementById('filterDate');
    const filterAgeSelect = document.getElementById('filterAge');
    const clearFiltersButton = document.getElementById('clearFilters');
    
    // Statistics elements
    const totalCommentsSpan = document.getElementById('totalComments');
    const todayCommentsSpan = document.getElementById('todayComments');
    const weekCommentsSpan = document.getElementById('weekComments');
    const averageAgeSpan = document.getElementById('averageAge');

    // Modal elements
    const locationModal = document.getElementById('locationModal');
    const modalClientName = document.getElementById('modalClientName');
    const modalClientEmail = document.getElementById('modalClientEmail');
    const modalClientDate = document.getElementById('modalClientDate');
    const modalMapIframe = document.getElementById('modalMapIframe');
    const modalCoordinates = document.getElementById('modalCoordinates');
    const openInGoogleMapsButton = document.getElementById('openInGoogleMaps');

    // Check if required elements exist
    if (!commentsTableBody || !noCommentsMessage || !commentsError || !clearAllCommentsButton) {
        console.error('[Opiniones] Error: One or more DOM elements not found');
        if (commentsError) {
            commentsError.textContent = 'Error: Elementos de la página no encontrados.';
            commentsError.style.display = 'block';
        }
        return;
    }

    // Current filters
    let currentFilters = {
        name: '',
        date: '',
        age: ''
    };

    // Filter comments based on current filters
    function filterComments(comments) {
        return comments.filter(comment => {
            // Name filter
            if (currentFilters.name && !comment.name.toLowerCase().includes(currentFilters.name.toLowerCase())) {
                return false;
            }

            // Date filter
            if (currentFilters.date) {
                const commentDate = new Date(comment.timestamp).toISOString().split('T')[0];
                if (commentDate !== currentFilters.date) {
                    return false;
                }
            }

            // Age filter
            if (currentFilters.age) {
                const age = parseInt(comment.age);
                const [minAge, maxAge] = currentFilters.age.split('-').map(Number);
                if (age < minAge || age > maxAge) {
                    return false;
                }
            }

            return true;
        });
    }

    // Calculate statistics
    function updateStatistics(comments) {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayComments = comments.filter(comment => {
            const commentDate = new Date(comment.timestamp);
            return commentDate >= todayStart;
        });

        const weekComments = comments.filter(comment => {
            const commentDate = new Date(comment.timestamp);
            return commentDate >= weekAgo;
        });

        const totalAge = comments.reduce((sum, comment) => sum + parseInt(comment.age || 0), 0);
        const averageAge = comments.length > 0 ? Math.round(totalAge / comments.length) : 0;

        // Update statistics display with null checks
        if (totalCommentsSpan) totalCommentsSpan.textContent = comments.length;
        if (todayCommentsSpan) todayCommentsSpan.textContent = todayComments.length;
        if (weekCommentsSpan) weekCommentsSpan.textContent = weekComments.length;
        if (averageAgeSpan) averageAgeSpan.textContent = averageAge;
    }

    // Render comments table
    function renderComments() {
        const filteredComments = filterComments(comments);
        console.log('[Opiniones] Rendering comments:', filteredComments.length);

        if (filteredComments.length === 0) {
            commentsTableBody.innerHTML = '';
            noCommentsMessage.style.display = 'block';
            commentsError.style.display = 'none';
            updateStatistics(comments); // Use original comments for statistics
            return;
        }

        noCommentsMessage.style.display = 'none';
        commentsError.style.display = 'none';

        commentsTableBody.innerHTML = '';
        filteredComments.forEach(comment => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(comment.timestamp);
            const formattedDate = date.toLocaleDateString('es-ES');
            const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            // Truncate message if too long
            const truncatedMessage = comment.message.length > 100 
                ? comment.message.substring(0, 100) + '...' 
                : comment.message;

            // Location info
            const locationInfo = comment.coordinates 
                ? `Lat: ${comment.coordinates.lat.toFixed(4)}, Lng: ${comment.coordinates.lng.toFixed(4)}`
                : 'No disponible';

            row.innerHTML = `
                <td>
                    <div class="fw-bold">${formattedDate}</div>
                    <small class="text-muted">${formattedTime}</small>
                </td>
                <td>
                    <div class="fw-bold">${comment.name}</div>
                    <small class="text-muted">${comment.age} años</small>
                </td>
                <td>${comment.age}</td>
                <td>
                    <a href="mailto:${comment.email}" class="text-decoration-none">
                        ${comment.email}
                    </a>
                </td>
                <td>
                    <div title="${comment.message}">
                        ${truncatedMessage}
                    </div>                 
                </td>
                <td>
                    ${comment.coordinates ? 
                        `<button class="btn btn-sm btn-outline-primary" onclick="showLocation('${comment.id}')">
                            <i class="fa fa-map-marker-alt me-1"></i>Ver Ubicación
                        </button>` : 
                        '<span class="text-muted">No disponible</span>'
                    }
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-danger" onclick="deleteComment('${comment.id}')" 
                                title="Eliminar comentario">
                            <i class="fa fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="replyToComment('${comment.email}', '${comment.name}')" 
                                title="Responder por email">
                            <i class="fa fa-reply"></i>
                        </button>
                    </div>
                </td>
            `;
            commentsTableBody.appendChild(row);
        });

        updateStatistics(comments); // Use original comments for statistics
    }

    // Delete single comment
    window.deleteComment = function (id) {
        showConfirm('¿Estás seguro de que quieres eliminar este comentario?', function() {
            comments = comments.filter(comment => comment.id !== id);
            localStorage.setItem('comments', JSON.stringify(comments));
            renderComments();
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Comentario eliminado', { 
                    body: 'El comentario ha sido eliminado exitosamente.',
                    icon: '../../img/icon.png'
                });
            }
            
            console.log('[Opiniones] Comment deleted:', id);
        });
    };

    // Reply to comment via email
    window.replyToComment = function (email, name) {
        const subject = encodeURIComponent(`Respuesta a tu mensaje - Mundo Papelito`);
        const body = encodeURIComponent(`Hola ${name},\n\nGracias por contactarnos. Hemos recibido tu mensaje y queremos responderte...\n\nSaludos,\nEquipo Mundo Papelito`);
        window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    };

    // Show location in modal
    window.showLocation = function (id) {
        const comment = comments.find(c => c.id === id);
        if (!comment || !comment.coordinates) {
            showAlert('Ubicación no disponible para este comentario.', 'Sin ubicación', 'warning');
            return;
        }

        // Populate modal with comment info
        modalClientName.textContent = comment.name;
        modalClientEmail.textContent = comment.email;
        modalClientDate.textContent = new Date(comment.timestamp).toLocaleString('es-ES');
        modalCoordinates.textContent = `${comment.coordinates.lat}, ${comment.coordinates.lng}`;

        // Set map iframe source
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=${comment.coordinates.lat},${comment.coordinates.lng}&zoom=16`;
        modalMapIframe.src = mapUrl;

        // Set up "Open in Google Maps" button
        openInGoogleMapsButton.onclick = function() {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${comment.coordinates.lat},${comment.coordinates.lng}`;
            window.open(googleMapsUrl, '_blank');
        };

        // Show modal
        const modal = new bootstrap.Modal(locationModal);
        modal.show();
    };

    // Clear all comments
    clearAllCommentsButton.addEventListener('click', () => {
        showConfirm('¿Estás seguro de que quieres eliminar TODOS los comentarios? Esta acción no se puede deshacer.', function() {
            comments = [];
            localStorage.setItem('comments', JSON.stringify(comments));
            renderComments();
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Todos los comentarios eliminados', { 
                    body: 'Se han eliminado todos los comentarios exitosamente.',
                    icon: '../../img/icon.png'
                });
            }
            
            console.log('[Opiniones] All comments cleared');
        });
    });

    // Filter event listeners
    if (searchNameInput) {
        searchNameInput.addEventListener('input', (e) => {
            currentFilters.name = e.target.value;
            renderComments();
        });
    }

    if (filterDateInput) {
        filterDateInput.addEventListener('change', (e) => {
            currentFilters.date = e.target.value;
            renderComments();
        });
    }

    if (filterAgeSelect) {
        filterAgeSelect.addEventListener('change', (e) => {
            currentFilters.age = e.target.value;
            renderComments();
        });
    }

    // Clear filters
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', () => {
            currentFilters = { name: '', date: '', age: '' };
            if (searchNameInput) searchNameInput.value = '';
            if (filterDateInput) filterDateInput.value = '';
            if (filterAgeSelect) filterAgeSelect.value = '';
            renderComments();
        });
    }

    // Initial render
    renderComments();

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
        console.log('[Opiniones] WOW.js initialized');
    } else {
        console.warn('[Opiniones] WOW.js not loaded');
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    console.log('[Opiniones] Comments management initialized successfully');
};
