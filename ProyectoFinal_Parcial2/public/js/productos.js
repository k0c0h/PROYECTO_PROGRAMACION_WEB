console.log('[Productos] Script loaded');

window.initProductos = function () {
    console.log('[Productos] initProductos called, initializing products');

    // Initial product data
    const initialProducts = [
        { id: '_1', name: 'Cuaderno', price: 10.99, quantity: 100, image: './public/img/product1.jpg' },
        { id: '_2', name: 'Lápiz', price: 1.99, quantity: 200, image: './public/img/product2.jpg' },
        { id: '_3', name: 'Borrador', price: 0.99, quantity: 150, image: './public/img/product3.jpg' }
    ];

    // Initialize products in localStorage if empty
    let products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) {
        products = initialProducts;
        localStorage.setItem('products', JSON.stringify(products));
    } else {
        // Ensure existing products have quantity field
        products = products.map(p => ({ ...p, quantity: p.quantity || 0 }));
        localStorage.setItem('products', JSON.stringify(products));
    }
    console.log('[Productos] Products loaded:', products);

    // Get DOM elements
    const publicView = document.getElementById('publicView');
    const adminView = document.getElementById('adminView');
    const publicProductList = document.getElementById('publicProductList');
    const productError = document.getElementById('productError');
    const productForm = document.getElementById('productForm');
    const productTableBody = document.getElementById('productTableBody');
    const productImage = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');
    const productQuantityInput = document.getElementById('productQuantity');
    const cancelEditButton = document.getElementById('cancelEdit');
    const startCameraButton = document.getElementById('startCamera');
    const capturePhotoButton = document.getElementById('capturePhoto');
    const productCamera = document.getElementById('productCamera');
    const productCanvas = document.getElementById('productCanvas');

    // Check if required elements exist
    if (!publicView || !adminView || !publicProductList || !productError || !productForm || !productTableBody || !productQuantityInput || !startCameraButton || !capturePhotoButton || !productCamera || !productCanvas) {
        console.error('[Productos] Error: One or more DOM elements not found', {
            publicView: !!publicView,
            adminView: !!adminView,
            publicProductList: !!publicProductList,
            productError: !!productError,
            productForm: !!productForm,
            productTableBody: !!productTableBody,
            productQuantityInput: !!productQuantityInput,
            startCameraButton: !!startCameraButton,
            capturePhotoButton: !!capturePhotoButton,
            productCamera: !!productCamera,
            productCanvas: !!productCanvas
        });
        if (productError) {
            productError.textContent = 'Error: No se encontraron los elementos de la página.';
            productError.style.display = 'block';
        }
        return;
    }

    // Toggle views based on admin session
    const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
    console.log('[Productos] adminSession:', isAdmin);
    publicView.style.display = isAdmin ? 'none' : 'block';
    adminView.style.display = isAdmin ? 'block' : 'none';
    console.log('[Productos] publicView display:', publicView.style.display);
    console.log('[Productos] adminView display:', adminView.style.display);

    // Public view: Render products
    function renderPublicProducts() {
        publicProductList.innerHTML = '';
        if (products.length === 0) {
            console.warn('[Productos] Warning: No products found in localStorage');
            productError.textContent = 'No hay productos disponibles.';
            productError.style.display = 'block';
            return;
        }
        products.forEach((product, index) => {
            const delay = (index % 4) * 0.2 + 0.1;
            const div = document.createElement('div');
            div.className = `col-lg-3 col-md-6 wow fadeInUp`;
            div.setAttribute('data-wow-delay', `${delay}s`);
            div.innerHTML = `
                <div class="team-item bg-light">
                    <div class="overflow-hidden">
                        <img class="img-fluid" src="${product.image || './public/img/default-product.jpg'}" alt="${product.name}">
                    </div>
                    <div class="text-center p-4">
                        <h5 class="mb-0">${product.name}</h5>
                        <small>
                            <p>Precio: $${product.price}</p>
                            <p>Cantidad disponible: ${product.quantity}</p>
                        </small>
                    </div>
                </div>
            `;
            publicProductList.appendChild(div);
        });
        productError.style.display = 'none';
        console.log('[Productos] Public products rendered:', products.length);
    }

    // Admin view: Render product table
    function renderAdminProducts() {
        if (!localStorage.getItem('adminSession')) return;
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.quantity}</td>
                <td><img src="${product.image || './public/img/default-product.jpg'}" class="img-fluid" style="max-height: 50px;" alt="Producto"></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editProduct('${product.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Eliminar</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
        console.log('[Productos] Admin products rendered:', products.length);
    }

    // Generate unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Camera handling
    let stream = null;

    // Start camera
    if (startCameraButton) {
        startCameraButton.addEventListener('click', async () => {
            console.log('[Productos] Starting camera');
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                productCamera.srcObject = stream;
                productCamera.style.display = 'block';
                capturePhotoButton.style.display = 'block';
                startCameraButton.style.display = 'none';
            } catch (error) {
                console.error('[Productos] Error accessing camera:', error);
                if (productError) {
                    productError.textContent = 'Error al acceder a la cámara: ' + error.message;
                    productError.style.display = 'block';
                }
            }
        });
    }

    // Capture photo
    if (capturePhotoButton) {
        capturePhotoButton.addEventListener('click', () => {
            console.log('[Productos] Capturing photo');
            const context = productCanvas.getContext('2d');
            productCanvas.width = productCamera.videoWidth;
            productCanvas.height = productCamera.videoHeight;
            context.drawImage(productCamera, 0, 0, productCanvas.width, productCanvas.height);
            const imageDataUrl = productCanvas.toDataURL('image/jpeg');
            productImagePreview.src = imageDataUrl;
            productImagePreview.style.display = 'block';
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            productCamera.style.display = 'none';
            capturePhotoButton.style.display = 'none';
            startCameraButton.style.display = 'block';
        });
    }

    // Handle file input for image
    if (productImage) {
        productImage.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (productImagePreview) {
                        productImagePreview.src = e.target.result;
                        productImagePreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    if (productForm) {
        console.log('[Productos] productForm event listener attached');
        productForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('productId').value || generateId();
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const image = productImagePreview ? productImagePreview.src : '';

            if (quantity < 0) {
                productError.textContent = 'La cantidad no puede ser negativa.';
                productError.style.display = 'block';
                return;
            }

            const product = { id, name, price, quantity, image };

            if (document.getElementById('productId').value) {
                // Edit existing product
                const index = products.findIndex(p => p.id === id);
                products[index] = product;
            } else {
                // Add new product
                products.push(product);
            }

            // Save to localStorage
            localStorage.setItem('products', JSON.stringify(products));

            // Reset form
            productForm.reset();
            if (productImagePreview) productImagePreview.style.display = 'none';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            document.getElementById('productId').value = '';
            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                productCamera.style.display = 'none';
                capturePhotoButton.style.display = 'none';
                startCameraButton.style.display = 'block';
            }

            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Producto guardado', { body: `${name} ha sido guardado exitosamente.` });
            }

            // Refresh views
            renderPublicProducts();
            renderAdminProducts();
        });
    }

    // Edit product
    window.editProduct = function (id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        if (product.image && productImagePreview) {
            productImagePreview.src = product.image;
            productImagePreview.style.display = 'block';
        }
        if (cancelEditButton) cancelEditButton.style.display = 'block';
    };

    // Delete product
    window.deleteProduct = function (id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            renderPublicProducts();
            renderAdminProducts();
            if (Notification.permission === 'granted') {
                new Notification('Producto eliminado', { body: 'El producto ha sido eliminado.' });
            }
        }
    };

    // Cancel edit
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            productForm.reset();
            if (productImagePreview) productImagePreview.style.display = 'none';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            document.getElementById('productId').value = '';
            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                productCamera.style.display = 'none';
                capturePhotoButton.style.display = 'none';
                startCameraButton.style.display = 'block';
            }
        });
    }

    // Initial render
    renderPublicProducts();
    renderAdminProducts();

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
        console.log('[Productos] WOW.js initialized');
    } else {
        console.warn('[Productos] WOW.js not loaded');
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
};