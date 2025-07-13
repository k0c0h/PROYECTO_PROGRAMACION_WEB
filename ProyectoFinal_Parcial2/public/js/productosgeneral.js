console.log('[ProductosGeneral] Script loaded');

window.initProductos = function () {
    console.log('[ProductosGeneral] initProductos called, initializing products');

    // Determine the correct image base path based on current location
    function getImageBasePath() {
        const currentPath = window.location.pathname;
        const currentURL = window.location.href;
        
        // Check if we're in a subdirectory (admin or vendor pages)
        if (currentPath.includes('paginaAdmin') || currentPath.includes('paginaVendedor') || 
            currentURL.includes('indexAdmin.html') || currentURL.includes('indexVendedor.html')) {
            return '../../img/';
        } else {
            // Main site (index.html or SPA pages)
            return './public/img/';
        }
    }

    const imageBasePath = getImageBasePath();
    console.log('[ProductosGeneral] Image base path:', imageBasePath);

    // Initial product data with dynamic image paths
    const initialProducts = [
        { id: '_1', name: 'Lápices', price: 1.00, quantity: 100, image: imageBasePath + 'lapices.jpg' },
        { id: '_2', name: 'Cuadernos', price: 2.50, quantity: 200, image: imageBasePath + 'cuadernos.jpg' },
        { id: '_3', name: 'Resaltadores', price: 1.50, quantity: 150, image: imageBasePath + 'resaltadores.jpg' },
        { id: '_4', name: 'Gomas de borrar', price: 0.50, quantity: 300, image: imageBasePath + 'borrador.jpg' },
        { id: '_5', name: 'Carpetas', price: 3.00, quantity: 80, image: imageBasePath + 'carpetas.jpg' },
        { id: '_6', name: 'Marcadores permanentes', price: 2.00, quantity: 120, image: imageBasePath + 'marcador.jpg' },
        { id: '_7', name: 'Tijeras', price: 1.75, quantity: 90, image: imageBasePath + 'tijera.jpg' },
        { id: '_8', name: 'Esferos', price: 0.75, quantity: 250, image: imageBasePath + 'esferos.png' },
        { id: '_9', name: 'Mochilas escolares', price: 15.00, quantity: 50, image: imageBasePath + 'mochila.jpg' },
        { id: '_10', name: 'Pizarras de corcho', price: 10.00, quantity: 30, image: imageBasePath + 'pizarrac.jpg' },
        { id: '_11', name: 'Reglas de geometría', price: 0.80, quantity: 200, image: imageBasePath + 'reglas.jpg' },
        { id: '_12', name: 'Sacapuntas', price: 0.50, quantity: 150, image: imageBasePath + 'sacapuntas.jpg' },
        { id: '_13', name: 'Lienzos para pintar', price: 5.00, quantity: 60, image: imageBasePath + 'lienzos.jpg' },
        { id: '_14', name: 'Temperas de pintura', price: 4.00, quantity: 100, image: imageBasePath + 'temperas.jpg' },
        { id: '_15', name: 'Grapadoras', price: 3.50, quantity: 70, image: imageBasePath + 'grapadora.jpg' },
        { id: '_16', name: 'Paquetes de hojas', price: 2.25, quantity: 120, image: imageBasePath + 'paqueteshoja.jpg' }
    ];

    // Initialize products in localStorage if empty or update paths if needed
    let products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) {
        products = initialProducts;
        localStorage.setItem('products', JSON.stringify(products));
        console.log('[ProductosGeneral] Initialized with default products');
    } else {
        // Update image paths only for default images, preserve base64 custom images
        let needsUpdate = false;
        const updatedProducts = products.map(product => {
            // Don't update if image is base64 data (starts with 'data:')
            if (product.image && product.image.startsWith('data:')) {
                console.log('[ProductosGeneral] Preserving base64 image for:', product.name);
                return product;
            }
            
            // Only update default image paths that don't match current context
            if (product.image && !product.image.startsWith(imageBasePath) && !product.image.startsWith('data:')) {
                // Extract just the filename from the current path
                const filename = product.image.split('/').pop();
                const newPath = imageBasePath + filename;
                needsUpdate = true;
                console.log('[ProductosGeneral] Updating default image path for:', product.name, 'from:', product.image, 'to:', newPath);
                return { ...product, image: newPath };
            }
            return product;
        });

        if (needsUpdate) {
            products = updatedProducts;
            localStorage.setItem('products', JSON.stringify(products));
            console.log('[ProductosGeneral] Updated default image paths for current context');
        }

        // Ensure existing products have quantity field
        products = products.map(p => ({ ...p, quantity: p.quantity || 0 }));
        localStorage.setItem('products', JSON.stringify(products));
    }
    console.log('[ProductosGeneral] Products loaded:', products);

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

    // Determine if we're in admin-only page or vendor-only page
    const currentPath = window.location.pathname;
    const currentURL = window.location.href;
    
    // Check if we're in specific admin/vendor pages that should only show management view
    const isAdminOnlyPage = !publicView || !adminView || publicView.style.display === 'none' ||
                           currentURL.includes('productosadmin.html') ||
                           currentPath.includes('paginaAdmin');
                           
    const isVendorOnlyPage = currentURL.includes('productosvendedor.html') ||
                            currentPath.includes('paginaVendedor');
    
    const isManagementOnlyPage = isAdminOnlyPage || isVendorOnlyPage;
    
    console.log('[ProductosGeneral] Page type detected:', {
        isAdminOnlyPage,
        isVendorOnlyPage,
        isManagementOnlyPage,
        currentPath,
        currentURL
    });

    // Check if required elements exist
    if (!productTableBody || !productError) {
        console.error('[ProductosGeneral] Error: Essential DOM elements not found', {
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
    
    console.log('[ProductosGeneral] Form elements available:', hasFormElements);

    // Toggle views based on page type and admin or vendor session
    if (!isManagementOnlyPage && publicView && adminView) {
        // Standard SPA pages (like productosindex.html from main site)
        const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
        const isVendor = localStorage.getItem('vendorSession') === 'loggedIn';
        const isEmployee = localStorage.getItem('currentEmployee');
        const isLoggedIn = isAdmin || isVendor || isEmployee;
        
        console.log('[ProductosGeneral] SPA Page - adminSession:', isAdmin);
        console.log('[ProductosGeneral] SPA Page - vendorSession:', isVendor);
        console.log('[ProductosGeneral] SPA Page - currentEmployee:', !!isEmployee);
        console.log('[ProductosGeneral] SPA Page - isLoggedIn:', isLoggedIn);
        console.log('[ProductosGeneral] SPA Page - isPublicProductAccess:', window.isPublicProductAccess);
        
        // Always show public view
        publicView.style.display = 'block';
        
        // Only show admin view if logged in AND NOT in public access mode
        const shouldShowAdminView = isLoggedIn && !window.isPublicProductAccess;
        adminView.style.display = shouldShowAdminView ? 'block' : 'none';
        
        console.log('[ProductosGeneral] SPA Page - publicView display:', publicView.style.display);
        console.log('[ProductosGeneral] SPA Page - adminView display:', adminView.style.display);
        console.log('[ProductosGeneral] SPA Page - shouldShowAdminView:', shouldShowAdminView);
    } else if (isManagementOnlyPage && publicView && adminView) {
        // Management-only pages (admin/vendor specific pages)
        console.log('[ProductosGeneral] Management-only page detected');
        
        // Hide public view, show only admin view
        publicView.style.display = 'none';
        adminView.style.display = 'block';
        
        console.log('[ProductosGeneral] Management Page - publicView display: none');
        console.log('[ProductosGeneral] Management Page - adminView display: block');
        
        // Hide form for vendor pages (read-only mode)
        if (isVendorOnlyPage && productForm) {
            productForm.style.display = 'none';
            console.log('[ProductosGeneral] Form hidden for vendor read-only mode');
        }
    }

    // Public view: Render products
    function renderPublicProducts() {
        // Skip if no publicProductList element or in management-only page
        if (!publicProductList || isManagementOnlyPage) {
            console.log('[ProductosGeneral] Skipping public products render - management-only page');
            return;
        }
        
        publicProductList.innerHTML = '';
        if (products.length === 0) {
            console.warn('[ProductosGeneral] Warning: No products found in localStorage');
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
                        <img class="img-fluid" src="${product.image || imageBasePath + 'cat-1.jpg'}" alt="${product.name}" onerror="this.src='${imageBasePath}cat-1.jpg'">
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
        console.log('[ProductosGeneral] Public products rendered:', products.length);
    }

    // Admin view: Render product table
    function renderAdminProducts() {
        // For management-only pages, always render. For SPA pages, check sessions
        const shouldRender = isManagementOnlyPage || 
                           localStorage.getItem('adminSession') === 'loggedIn' || 
                           localStorage.getItem('vendorSession') === 'loggedIn';
        
        if (!shouldRender) {
            console.log('[ProductosGeneral] Skipping admin products render - not authorized');
            return;
        }
        
        if (!productTableBody) {
            console.warn('[ProductosGeneral] productTableBody not found');
            return;
        }
        
        productTableBody.innerHTML = '';
        const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
        const isCurrentlyInAdminPage = isAdminOnlyPage;
        const isCurrentlyInVendorPage = isVendorOnlyPage;
        
        // Vendor pages should be read-only (no editing capabilities)
        const isReadOnlyMode = isCurrentlyInVendorPage;
        
        console.log('[ProductosGeneral] Rendering products with permissions:', {
            isAdmin,
            isCurrentlyInAdminPage,
            isCurrentlyInVendorPage,
            isReadOnlyMode
        });
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            if (isReadOnlyMode) {
                // Vendor view: No actions column, read-only
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.quantity}</td>
                    <td><img src="${product.image || imageBasePath + 'cat-1.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.src='${imageBasePath}cat-1.jpg'"></td>
                `;
            } else {
                // Admin view: Full functionality with actions
                const canEdit = isAdmin || isCurrentlyInAdminPage;
                const actions = canEdit ? 
                    `<button class="btn btn-sm btn-warning me-2" onclick="editProduct('${product.id}')">Editar</button>
                     <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Eliminar</button>` :
                    `<span class="badge bg-info">Solo lectura</span>`;
                    
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.quantity}</td>
                    <td><img src="${product.image || imageBasePath + 'cat-1.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.src='${imageBasePath}cat-1.jpg'"></td>
                    <td>${actions}</td>
                `;
            }
            
            productTableBody.appendChild(row);
        });
        
        const userRole = isCurrentlyInAdminPage ? 'Admin' : (isCurrentlyInVendorPage ? 'Vendor' : 'User');
        console.log(`[ProductosGeneral] ${userRole} products rendered:`, products.length);
    }

    // Generate unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Function to clean form
    function cleanProductForm() {
        if (productForm) {
            productForm.reset();
            document.getElementById('productId').value = '';
            if (productImagePreview) {
                productImagePreview.style.display = 'none';
                productImagePreview.src = '';
            }
            if (cancelEditButton) {
                cancelEditButton.style.display = 'none';
            }
            console.log('[ProductosGeneral] Form cleaned');
        }
    }

    // Camera handling
    let stream = null;

    // Start camera
    if (startCameraButton) {
        startCameraButton.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                productCamera.srcObject = stream;
                productCamera.style.display = 'block';
                capturePhotoButton.style.display = 'block';
                startCameraButton.textContent = 'Cerrar Cámara';
                startCameraButton.onclick = stopCamera;
            } catch (error) {
                console.error('Error accessing camera:', error);
                showAlert('Error al acceder a la cámara', 'Error', 'error');
            }
        });
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (productCamera) {
            productCamera.style.display = 'none';
            productCamera.srcObject = null;
        }
        if (capturePhotoButton) capturePhotoButton.style.display = 'none';
        if (startCameraButton) {
            startCameraButton.textContent = 'Abrir Cámara';
            startCameraButton.onclick = null;
            // Re-add the original event listener
            startCameraButton.click();
        }
    }

    // Capture photo
    if (capturePhotoButton) {
        capturePhotoButton.addEventListener('click', () => {
            if (productCamera && productCanvas) {
                const context = productCanvas.getContext('2d');
                productCanvas.width = productCamera.videoWidth;
                productCanvas.height = productCamera.videoHeight;
                context.drawImage(productCamera, 0, 0);
                
                const imageData = productCanvas.toDataURL('image/jpeg', 0.8);
                if (productImagePreview) {
                    productImagePreview.src = imageData;
                    productImagePreview.style.display = 'block';
                }
                stopCamera();
            }
        });
    }

    // Handle file input for image
    if (productImage) {
        productImage.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file && productImagePreview) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    productImagePreview.src = e.target.result;
                    productImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    if (productForm) {
        console.log('[ProductosGeneral] productForm event listener attached');
        productForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const id = document.getElementById('productId').value;
            const name = document.getElementById('productName').value.trim();
            const price = parseFloat(document.getElementById('productPrice').value);
            const quantity = parseInt(document.getElementById('productQuantity').value);
            
            if (!name || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
                showAlert('Por favor, completa todos los campos correctamente', 'Campos requeridos', 'warning');
                return;
            }
            
            let imageData = null;
            if (productImagePreview && productImagePreview.style.display !== 'none') {
                imageData = productImagePreview.src;
                console.log('[ProductosGeneral] Image data captured:', imageData.startsWith('data:') ? 'Base64 image' : 'Image path');
            }
            
            if (id) {
                // Edit existing product
                const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    const updatedProduct = {
                        ...products[index],
                        name,
                        price,
                        quantity
                    };
                    
                    // Only update image if new image data is provided
                    if (imageData) {
                        updatedProduct.image = imageData;
                    }
                    
                    products[index] = updatedProduct;
                    console.log('[ProductosGeneral] Product updated:', products[index]);
                }
            } else {
                // Add new product
                const newProduct = {
                    id: generateId(),
                    name,
                    price,
                    quantity,
                    image: imageData || imageBasePath + 'cat-1.jpg'
                };
                products.push(newProduct);
                console.log('[ProductosGeneral] Product added:', newProduct);
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            renderPublicProducts();
            renderAdminProducts();
            
            // Reset form
            cleanProductForm();
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Producto guardado exitosamente');
            }
        });
    }

    // Edit product (for admins or management pages)
    window.editProduct = function (id) {
        const canEdit = isManagementOnlyPage || localStorage.getItem('adminSession') === 'loggedIn';
        if (!canEdit) {
            showAlert('No tienes permisos para editar productos', 'Acceso denegado', 'error');
            return;
        }
        
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        
        // Handle image display
        if (product.image && productImagePreview) {
            productImagePreview.src = product.image;
            productImagePreview.style.display = 'block';
            console.log('[ProductosGeneral] Editing product with image:', product.image.startsWith('data:') ? 'Base64 image' : 'Image path');
        }
        
        if (cancelEditButton) cancelEditButton.style.display = 'block';
    };

    // Delete product (for admins or management pages)
    window.deleteProduct = function (id) {
        const canDelete = isManagementOnlyPage || localStorage.getItem('adminSession') === 'loggedIn';
        if (!canDelete) {
            showAlert('No tienes permisos para eliminar productos', 'Acceso denegado', 'error');
            return;
        }
        
        showConfirm('¿Estás seguro de eliminar este producto?', function() {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            renderPublicProducts();
            renderAdminProducts();
            
            if (Notification.permission === 'granted') {
                new Notification('Producto eliminado exitosamente');
            }
        });
    };

    // Cancel edit
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            cleanProductForm();
        });
    }

    // Initial render
    renderPublicProducts();
    renderAdminProducts();

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
        console.log('[ProductosGeneral] WOW.js initialized');
    } else {
        console.warn('[ProductosGeneral] WOW.js not loaded');
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
};
