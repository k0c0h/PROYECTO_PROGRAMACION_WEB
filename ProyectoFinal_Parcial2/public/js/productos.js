console.log('[Productos] Script loaded');

window.initProductos = function () {
    console.log('[Productos] initProductos called, initializing products');

    // Initial product data
    const initialProducts = [
        { id: '_1', name: 'Lápices', price: 1.00, quantity: 100, image: './public/img/lapices.jpg' },
        { id: '_2', name: 'Cuadernos', price: 2.50, quantity: 200, image: './public/img/cuadernos.jpg' },
        { id: '_3', name: 'Resaltadores', price: 1.50, quantity: 150, image: './public/img/resaltadores.jpg' },
        { id: '_4', name: 'Gomas de borrar', price: 0.50, quantity: 300, image: './public/img/borrador.jpg' },
        { id: '_5', name: 'Carpetas', price: 3.00, quantity: 80, image: './public/img/carpetas.jpg' },
        { id: '_6', name: 'Marcadores permanentes', price: 2.00, quantity: 120, image: './public/img/marcador.jpg' },
        { id: '_7', name: 'Tijeras', price: 1.75, quantity: 90, image: './public/img/tijera.jpg' },
        { id: '_8', name: 'Esferos', price: 0.75, quantity: 250, image: './public/img/esferos.png' },
        { id: '_9', name: 'Mochilas escolares', price: 15.00, quantity: 50, image: './public/img/mochila.jpg' },
        { id: '_10', name: 'Pizarras de corcho', price: 10.00, quantity: 30, image: './public/img/pizarrac.jpg' },
        { id: '_11', name: 'Reglas de geometría', price: 0.80, quantity: 200, image: './public/img/reglas.jpg' },
        { id: '_12', name: 'Sacapuntas', price: 0.50, quantity: 150, image: './public/img/sacapuntas.jpg' },
        { id: '_13', name: 'Lienzos para pintar', price: 5.00, quantity: 60, image: './public/img/lienzos.jpg' },
        { id: '_14', name: 'Temperas de pintura', price: 4.00, quantity: 100, image: './public/img/temperas.jpg' },
        { id: '_15', name: 'Grapadoras', price: 3.50, quantity: 70, image: './public/img/grapadora.jpg' },
        { id: '_16', name: 'Paquetes de hojas', price: 2.25, quantity: 120, image: './public/img/paqueteshoja.jpg' }
    ];

    // Initialize products in localStorage if empty
    let products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) {
        products = initialProducts;
        localStorage.setItem('products', JSON.stringify(products));
    } else {
        // Force update with new image paths (check for old relative paths)
        const needsUpdate = products.some(p => p.image && (p.image.includes('../../img/') || !p.image.includes('./public/img/')));
        if (needsUpdate) {
            console.log('[Productos] Updating image paths...');
            products = initialProducts;
            localStorage.setItem('products', JSON.stringify(products));
        } else {
            // Ensure existing products have quantity field
            products = products.map(p => ({ ...p, quantity: p.quantity || 0 }));
            localStorage.setItem('products', JSON.stringify(products));
        }
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

    // Determine if we're in admin-only page (like productosadmin.html)
    const isAdminOnlyPage = !publicView || !adminView || publicView.style.display === 'none';
    
    console.log('[Productos] Page type detected:', isAdminOnlyPage ? 'Admin-only page' : 'Standard SPA page');

    // Check if required elements exist
    if (!productTableBody || !productError) {
        console.error('[Productos] Error: Essential DOM elements not found', {
            productTableBody: !!productTableBody,
            productError: !!productError
        });
        if (productError) {
            productError.textContent = 'Error: No se encontraron los elementos esenciales de la página.';
            productError.style.display = 'block';
        }
        return;
    }

    // Optional elements (may not exist in some views)
    const hasFormElements = productForm && productQuantityInput && startCameraButton && capturePhotoButton && productCamera && productCanvas;
    
    console.log('[Productos] Form elements available:', hasFormElements);

    // Toggle views based on admin or vendor session (only for SPA pages)
    if (!isAdminOnlyPage && publicView && adminView) {
        const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
        const isVendor = localStorage.getItem('vendorSession') === 'loggedIn';
        const isEmployee = localStorage.getItem('currentEmployee');
        const isLoggedIn = isAdmin || isVendor || isEmployee;
        
        console.log('[Productos] adminSession:', isAdmin);
        console.log('[Productos] vendorSession:', isVendor);
        console.log('[Productos] currentEmployee:', !!isEmployee);
        console.log('[Productos] isLoggedIn:', isLoggedIn);
        console.log('[Productos] isPublicProductAccess:', window.isPublicProductAccess);
        
        // Always show public view
        publicView.style.display = 'block';
        
        // Only show admin view if logged in AND NOT in public access mode
        const shouldShowAdminView = isLoggedIn && !window.isPublicProductAccess;
        adminView.style.display = shouldShowAdminView ? 'block' : 'none';
        
        console.log('[Productos] publicView display:', publicView.style.display);
        console.log('[Productos] adminView display:', adminView.style.display);
        console.log('[Productos] shouldShowAdminView:', shouldShowAdminView);
    }

    // Public view: Render products
    function renderPublicProducts() {
        // Skip if no publicProductList element or in admin-only page
        if (!publicProductList || isAdminOnlyPage) {
            console.log('[Productos] Skipping public products render - admin-only page');
            return;
        }
        
        publicProductList.innerHTML = '';
        if (products.length === 0) {
            console.warn('[Productos] Warning: No products found in localStorage');
            if (productError) {
                productError.textContent = 'No hay productos disponibles.';
                productError.style.display = 'block';
            }
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
                        <img class="img-fluid" src="${product.image || '../../img/cat-1.jpg'}" alt="${product.name}">
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
        if (productError) productError.style.display = 'none';
        console.log('[Productos] Public products rendered:', products.length);
    }

    // Admin view: Render product table
    function renderAdminProducts() {
        // For admin-only pages, always render. For SPA pages, check sessions
        const shouldRender = isAdminOnlyPage || 
                           localStorage.getItem('adminSession') === 'loggedIn' || 
                           localStorage.getItem('vendorSession') === 'loggedIn';
        
        if (!shouldRender) {
            console.log('[Productos] Skipping admin products render - no valid session');
            return;
        }
        
        if (!productTableBody) {
            console.warn('[Productos] productTableBody not found, skipping admin render');
            return;
        }
        
        productTableBody.innerHTML = '';
        const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Determine stock status
            let stockStatus = '';
            let stockClass = '';
            if (product.quantity > 50) {
                stockStatus = 'En Stock';
                stockClass = 'text-success';
            } else if (product.quantity > 0) {
                stockStatus = 'Bajo Stock';
                stockClass = 'text-warning';
            } else {
                stockStatus = 'Agotado';
                stockClass = 'text-danger';
            }
            
            // Build row HTML based on user role or admin-only page
            if (isAdmin || isAdminOnlyPage) {
                // Admin view: Show all columns including actions
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.quantity}</td>
                    <td><img src="${product.image || '../../img/default-product.jpg'}" class="img-fluid" style="max-height: 50px;" alt="Producto"></td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editProduct('${product.id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Eliminar</button>
                    </td>
                `;
            } else {
                // Vendor view: Show products with status, no actions
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.quantity}</td>
                    <td><img src="${product.image || '../../img/default-product.jpg'}" class="img-fluid" style="max-height: 50px;" alt="Producto"></td>
                    <td><span class="${stockClass}">${stockStatus}</span></td>
                `;
            }
            
            productTableBody.appendChild(row);
        });
        
        const userRole = isAdmin || isAdminOnlyPage ? 'Admin' : 'Vendor';
        console.log(`[Productos] ${userRole} products rendered:`, products.length);
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

    // Edit product (for admins or admin-only pages)
    window.editProduct = function (id) {
        const canEdit = isAdminOnlyPage || localStorage.getItem('adminSession') === 'loggedIn';
        if (!canEdit) {
            console.warn('[Productos] Edit product access denied: Not an admin');
            return;
        }
        
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

    // Delete product (for admins or admin-only pages)
    window.deleteProduct = function (id) {
        const canDelete = isAdminOnlyPage || localStorage.getItem('adminSession') === 'loggedIn';
        if (!canDelete) {
            console.warn('[Productos] Delete product access denied: Not an admin');
            return;
        }
        
        showConfirm('¿Estás seguro de eliminar este producto?', function() {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            renderPublicProducts();
            renderAdminProducts();
            if (Notification.permission === 'granted') {
                new Notification('Producto eliminado', { body: 'El producto ha sido eliminado.' });
            }
        });
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