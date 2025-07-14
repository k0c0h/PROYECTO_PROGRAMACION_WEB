console.log('[Clientes] Script loaded');

// Global function to clean localStorage manually
window.cleanLocalStorageClients = function() {
    console.log('[Clientes] Cleaning localStorage clients manually...');
    
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    console.log('[Clientes] Before cleaning:', clients);
    
    // Filter out empty or invalid clients
    const cleanedClients = clients.filter(client => {
        return client && 
               typeof client === 'object' && 
               client.id && 
               client.name && 
               client.email &&
               client.name.trim() !== '' &&
               client.email.trim() !== '';
    });
    
    console.log('[Clientes] After cleaning:', cleanedClients);
    console.log('[Clientes] Removed', clients.length - cleanedClients.length, 'corrupted entries');
    
    localStorage.setItem('clients', JSON.stringify(cleanedClients));
    
    if (typeof window.initClientes === 'function') {
        window.initClientes();
    }
    
    return cleanedClients;
};

window.initClientes = function () {
    console.log('[Clientes] initClientes called, initializing clients');

    // Function to determine the correct image path based on current location
    function getImageBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('paginaAdmin') || currentPath.includes('paginaVendedor')) {
            return '../../img/';
        }
        return './public/img/';
    }

    const imageBasePath = getImageBasePath();
    console.log('[Clientes] Image base path:', imageBasePath);

    // Initial client data
    const initialClients = [
        {
            id: '_client1',
            name: 'Juan Pérez',
            email: 'juan.perez@email.com',
            cedula: '1234567890',
            phone: '0987654321',
            address: 'Av. Amazonas 123, Quito',
            photo: imageBasePath + 'images.png'
        },
        {
            id: '_client2',
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            cedula: '0987654321',
            phone: '0912345678',
            address: 'Calle 10 de Agosto 456, Quito',
            photo: imageBasePath + 'images.png'
        },
        {
            id: '_client3',
            name: 'Carlos Rodríguez',
            email: 'carlos.rodriguez@email.com',
            cedula: '1122334455',
            phone: '0923456789',
            address: 'Av. Patria 789, Quito',
            photo: imageBasePath + 'images.png'
        }
    ];

    // Function to clean corrupted clients
    function cleanCorruptedClients(clients) {
        return clients.filter(client => {
            // Remove clients that are empty objects or missing required fields
            return client && 
                   typeof client === 'object' && 
                   client.id && 
                   client.name && 
                   client.email &&
                   client.name.trim() !== '' &&
                   client.email.trim() !== '';
        });
    }

    // Initialize clients in localStorage if empty
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    // Clean corrupted clients
    const originalLength = clients.length;
    clients = cleanCorruptedClients(clients);
    
    if (clients.length !== originalLength) {
        console.log('[Clientes] Cleaned corrupted clients:', originalLength - clients.length, 'removed');
        localStorage.setItem('clients', JSON.stringify(clients));
    }
    
    // Migrate existing clients to add new fields
    let migrationNeeded = false;
    clients = clients.map(client => {
        if (!client.cedula || !client.phone || !client.address) {
            migrationNeeded = true;
            return {
                ...client,
                cedula: client.cedula || '0000000000',
                phone: client.phone || '0000000000',
                address: client.address || 'Dirección no especificada'
            };
        }
        return client;
    });
    
    if (migrationNeeded) {
        console.log('[Clientes] Migrated clients with new fields');
        localStorage.setItem('clients', JSON.stringify(clients));
    }
    
    if (clients.length === 0) {
        clients = initialClients;
        localStorage.setItem('clients', JSON.stringify(clients));
    }
    console.log('[Clientes] Clients loaded:', clients);

    // Get DOM elements
    const publicView = document.getElementById('publicView');
    const adminView = document.getElementById('adminView');
    const publicClientList = document.getElementById('publicClientList');
    const clientError = document.getElementById('clientError');
    const clientForm = document.getElementById('clientForm');
    const clientTableBody = document.getElementById('clientTableBody');
    const clientPhoto = document.getElementById('clientPhoto');
    const clientPhotoPreview = document.getElementById('clientPhotoPreview');
    const cancelEditButton = document.getElementById('cancelEdit');
    const startCameraButton = document.getElementById('startCamera');
    const capturePhotoButton = document.getElementById('capturePhoto');
    const clientCamera = document.getElementById('clientCamera');
    const clientCanvas = document.getElementById('clientCanvas');

    // Check if required elements exist
    if (!publicView || !adminView || !publicClientList || !clientError || !clientForm || !clientTableBody || !startCameraButton || !capturePhotoButton || !clientCamera || !clientCanvas) {
        console.error('[Clientes] Error: One or more DOM elements not found', {
            publicView: !!publicView,
            adminView: !!adminView,
            publicClientList: !!publicClientList,
            clientError: !!clientError,
            clientForm: !!clientForm,
            clientTableBody: !!clientTableBody,
            startCameraButton: !!startCameraButton,
            capturePhotoButton: !!capturePhotoButton,
            clientCamera: !!clientCamera,
            clientCanvas: !!clientCanvas
        });
        if (clientError) {
            clientError.textContent = 'Error: No se encontraron los elementos de la página.';
            clientError.style.display = 'block';
        }
        return;
    }

    // Toggle views based on admin or vendor session
    const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
    const isVendor = localStorage.getItem('vendorSession') === 'loggedIn';
    const hasAccess = isAdmin || isVendor;
    console.log('[Clientes] adminSession:', isAdmin, 'vendorSession:', isVendor, 'hasAccess:', hasAccess);
    publicView.style.display = hasAccess ? 'none' : 'block';
    adminView.style.display = hasAccess ? 'block' : 'none';
    console.log('[Clientes] publicView display:', publicView.style.display);
    console.log('[Clientes] adminView display:', adminView.style.display);

    // Public view: Render clients
    function renderPublicClients() {
        publicClientList.innerHTML = '';
        
        // Filter valid clients before rendering
        const validClients = clients.filter(client => {
            return client && 
                   typeof client === 'object' && 
                   client.id && 
                   client.name && 
                   client.email &&
                   client.name.trim() !== '' &&
                   client.email.trim() !== '';
        });
        
        if (validClients.length === 0) {
            console.warn('[Clientes] Warning: No valid clients found');
            clientError.textContent = 'No hay clientes disponibles.';
            clientError.style.display = 'block';
            return;
        }
        
        validClients.forEach((client, index) => {
            const delay = (index % 4) * 0.2 + 0.1;
            const div = document.createElement('div');
            div.className = `col-lg-3 col-md-6 wow fadeInUp`;
            div.setAttribute('data-wow-delay', `${delay}s`);
            div.innerHTML = `
                <div class="team-item bg-light">
                    <div class="overflow-hidden">
                        <img class="img-fluid" src="${client.photo || imageBasePath + 'images.png'}" alt="${client.name}">
                    </div>
                    <div class="text-center p-4">
                        <h5 class="mb-0">${client.name}</h5>
                        <small>
                            <p>Email: ${client.email}</p>
                            ${client.phone ? `<p>Teléfono: ${client.phone}</p>` : ''}
                            ${client.address ? `<p>Dirección: ${client.address}</p>` : ''}
                        </small>
                    </div>
                </div>
            `;
            publicClientList.appendChild(div);
        });
        clientError.style.display = 'none';
        console.log('[Clientes] Public clients rendered:', validClients.length);
    }

    // Admin view: Render client table
    function renderAdminClients() {
        if (!localStorage.getItem('adminSession') && !localStorage.getItem('vendorSession')) return;
        clientTableBody.innerHTML = '';
        
        // Filter valid clients before rendering
        const validClients = clients.filter(client => {
            return client && 
                   typeof client === 'object' && 
                   client.id && 
                   client.name && 
                   client.email &&
                   client.name.trim() !== '' &&
                   client.email.trim() !== '';
        });
        
        validClients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.cedula || 'N/A'}</td>
                <td>${client.phone || 'N/A'}</td>
                <td>${client.address || 'N/A'}</td>
                <td><img src="${client.photo || imageBasePath + 'images.png'}" class="img-fluid" style="max-height: 50px;" alt="Cliente"></td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick="editClient('${client.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteClient('${client.id}')">Eliminar</button>
                </td>
            `;
            clientTableBody.appendChild(row);
        });
        console.log('[Clientes] Admin clients rendered:', validClients.length);
    }

    // Generate unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Camera handling
    let stream = null;

    // Start camera
    if (startCameraButton) {
        startCameraButton.addEventListener('click', async () => {
            console.log('[Clientes] Starting camera');
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                clientCamera.srcObject = stream;
                clientCamera.style.display = 'block';
                capturePhotoButton.style.display = 'block';
                startCameraButton.style.display = 'none';
            } catch (error) {
                console.error('[Clientes] Error accessing camera:', error);
                if (clientError) {
                    clientError.textContent = 'Error al acceder a la cámara: ' + error.message;
                    clientError.style.display = 'block';
                }
            }
        });
    }

    // Capture photo
    if (capturePhotoButton) {
        capturePhotoButton.addEventListener('click', () => {
            console.log('[Clientes] Capturing photo');
            const context = clientCanvas.getContext('2d');
            clientCanvas.width = clientCamera.videoWidth;
            clientCanvas.height = clientCamera.videoHeight;
            context.drawImage(clientCamera, 0, 0, clientCanvas.width, clientCanvas.height);
            const imageDataUrl = clientCanvas.toDataURL('image/jpeg');
            clientPhotoPreview.src = imageDataUrl;
            clientPhotoPreview.style.display = 'block';
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            clientCamera.style.display = 'none';
            capturePhotoButton.style.display = 'none';
            startCameraButton.style.display = 'block';
        });
    }

    // Handle file input for photo
    if (clientPhoto) {
        clientPhoto.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (clientPhotoPreview) {
                        clientPhotoPreview.src = e.target.result;
                        clientPhotoPreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    if (clientForm) {
        console.log('[Clientes] clientForm event listener attached');
        clientForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('clientId').value || generateId();
            const name = document.getElementById('clientName').value;
            const email = document.getElementById('clientEmail').value;
            const cedula = document.getElementById('clientCedula').value;
            const phone = document.getElementById('clientPhone').value;
            const address = document.getElementById('clientAddress').value;
            const photo = clientPhotoPreview ? clientPhotoPreview.src : '';

            // Validaciones básicas
            if (!name.trim()) {
                showAlert('El nombre es requerido', 'Error de validación', 'error');
                return;
            }

            if (!email.trim()) {
                showAlert('El email es requerido', 'Error de validación', 'error');
                return;
            }

            if (!cedula.trim()) {
                showAlert('La cédula es requerida', 'Error de validación', 'error');
                return;
            }

            if (!phone.trim()) {
                showAlert('El teléfono es requerido', 'Error de validación', 'error');
                return;
            }

            if (!address.trim()) {
                showAlert('La dirección es requerida', 'Error de validación', 'error');
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('El formato del email no es válido', 'Error de validación', 'error');
                return;
            }

            // Validar que la cédula tenga 10 dígitos
            if (cedula.length !== 10 || !/^\d+$/.test(cedula)) {
                showAlert('La cédula debe tener 10 dígitos', 'Error de validación', 'error');
                return;
            }

            // Validar formato de teléfono (10 dígitos)
            if (phone.length !== 10 || !/^\d+$/.test(phone)) {
                showAlert('El teléfono debe tener 10 dígitos', 'Error de validación', 'error');
                return;
            }

            // Verificar que la cédula no esté duplicada
            const existingClient = clients.find(c => c.cedula === cedula && c.id !== id);
            if (existingClient) {
                showAlert('Ya existe un cliente con esta cédula', 'Error de validación', 'error');
                return;
            }

            const client = { id, name, email, cedula, phone, address, photo };

            if (document.getElementById('clientId').value) {
                // Edit existing client
                const index = clients.findIndex(c => c.id === id);
                clients[index] = client;
            } else {
                // Add new client
                clients.push(client);
            }

            // Save to localStorage
            localStorage.setItem('clients', JSON.stringify(clients));

            // Reset form
            clientForm.reset();
            if (clientPhotoPreview) clientPhotoPreview.style.display = 'none';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            document.getElementById('clientId').value = '';
            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                clientCamera.style.display = 'none';
                capturePhotoButton.style.display = 'none';
                startCameraButton.style.display = 'block';
            }

            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Cliente guardado', { body: `${name} ha sido guardado exitosamente.` });
            }

            // Refresh views
            renderPublicClients();
            renderAdminClients();
        });
    }

    // Edit client
    window.editClient = function (id) {
        const client = clients.find(c => c.id === id);
        if (!client) return;
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientCedula').value = client.cedula || '';
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientAddress').value = client.address || '';
        if (client.photo && clientPhotoPreview) {
            clientPhotoPreview.src = client.photo;
            clientPhotoPreview.style.display = 'block';
        }
        if (cancelEditButton) cancelEditButton.style.display = 'block';
    };

    // Delete client
    window.deleteClient = function (id) {
        showConfirm('¿Estás seguro de eliminar este cliente?', function() {
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem('clients', JSON.stringify(clients));
            renderPublicClients();
            renderAdminClients();
            if (Notification.permission === 'granted') {
                new Notification('Cliente eliminado', { body: 'El cliente ha sido eliminado.' });
            }
        });
    };

    // Cancel edit
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            clientForm.reset();
            if (clientPhotoPreview) clientPhotoPreview.style.display = 'none';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            document.getElementById('clientId').value = '';
            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                clientCamera.style.display = 'none';
                capturePhotoButton.style.display = 'none';
                startCameraButton.style.display = 'block';
            }
        });
    }

    // Initial render
    renderPublicClients();
    renderAdminClients();

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
        console.log('[Clientes] WOW.js initialized');
    } else {
        console.warn('[Clientes] WOW.js not loaded');
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
};