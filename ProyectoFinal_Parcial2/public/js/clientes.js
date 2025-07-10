console.log('[Clientes] Script loaded');

window.initClientes = function () {
    console.log('[Clientes] initClientes called, initializing clients');

    // Initial client data
    const initialClients = [
        { id: '_1', name: 'Juan Pérez', email: 'juan.perez@example.com', photo: './public/img/client1.jpg' },
        { id: '_2', name: 'María Gómez', email: 'maria.gomez@example.com', photo: './public/img/client2.jpg' },
        { id: '_3', name: 'Carlos López', email: 'carlos.lopez@example.com', photo: './public/img/client3.jpg' }
    ];

    // Initialize clients in localStorage if empty
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
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

    // Toggle views based on admin session
    const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
    console.log('[Clientes] adminSession:', isAdmin);
    publicView.style.display = isAdmin ? 'none' : 'block';
    adminView.style.display = isAdmin ? 'block' : 'none';
    console.log('[Clientes] publicView display:', publicView.style.display);
    console.log('[Clientes] adminView display:', adminView.style.display);

    // Public view: Render clients
    function renderPublicClients() {
        publicClientList.innerHTML = '';
        if (clients.length === 0) {
            console.warn('[Clientes] Warning: No clients found in localStorage');
            clientError.textContent = 'No hay clientes disponibles.';
            clientError.style.display = 'block';
            return;
        }
        clients.forEach((client, index) => {
            const delay = (index % 4) * 0.2 + 0.1;
            const div = document.createElement('div');
            div.className = `col-lg-3 col-md-6 wow fadeInUp`;
            div.setAttribute('data-wow-delay', `${delay}s`);
            div.innerHTML = `
                <div class="team-item bg-light">
                    <div class="overflow-hidden">
                        <img class="img-fluid" src="${client.photo || './public/img/default-client.jpg'}" alt="${client.name}">
                    </div>
                    <div class="text-center p-4">
                        <h5 class="mb-0">${client.name}</h5>
                        <small>
                            <p>Email: ${client.email}</p>
                        </small>
                    </div>
                </div>
            `;
            publicClientList.appendChild(div);
        });
        clientError.style.display = 'none';
        console.log('[Clientes] Public clients rendered:', clients.length);
    }

    // Admin view: Render client table
    function renderAdminClients() {
        if (!localStorage.getItem('adminSession')) return;
        clientTableBody.innerHTML = '';
        clients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td><img src="${client.photo || './public/img/default-client.jpg'}" class="img-fluid" style="max-height: 50px;" alt="Cliente"></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editClient('${client.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteClient('${client.id}')">Eliminar</button>
                </td>
            `;
            clientTableBody.appendChild(row);
        });
        console.log('[Clientes] Admin clients rendered:', clients.length);
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
            const photo = clientPhotoPreview ? clientPhotoPreview.src : '';

            const client = { id, name, email, photo };

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
        if (client.photo && clientPhotoPreview) {
            clientPhotoPreview.src = client.photo;
            clientPhotoPreview.style.display = 'block';
        }
        if (cancelEditButton) cancelEditButton.style.display = 'block';
    };

    // Delete client
    window.deleteClient = function (id) {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem('clients', JSON.stringify(clients));
            renderPublicClients();
            renderAdminClients();
            if (Notification.permission === 'granted') {
                new Notification('Cliente eliminado', { body: 'El cliente ha sido eliminado.' });
            }
        }
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