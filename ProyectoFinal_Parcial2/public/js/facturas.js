console.log('[Facturas] Script loaded');

window.initFacturas = function () {
    console.log('[Facturas] initFacturas called, initializing invoices');

    // Get clients and products from localStorage
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let invoiceItems = [];

    // Get DOM elements
    const publicView = document.getElementById('publicView');
    const adminView = document.getElementById('adminView');
    const clientSelect = document.getElementById('clientSelect');
    const clientInfo = document.getElementById('clientInfo');
    const clientNameSpan = document.getElementById('clientName');
    const clientEmailSpan = document.getElementById('clientEmail');
    const productSelect = document.getElementById('productSelect');
    const productQuantity = document.getElementById('productQuantity');
    const addProductButton = document.getElementById('addProduct');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const subtotalSpan = document.getElementById('subtotal');
    const ivaSpan = document.getElementById('iva');
    const totalSpan = document.getElementById('total');
    const generateInvoiceButton = document.getElementById('generateInvoice');
    const modalClientName = document.getElementById('modalClientName');
    const modalClientEmail = document.getElementById('modalClientEmail');
    const modalInvoiceTableBody = document.getElementById('modalInvoiceTableBody');
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalIva = document.getElementById('modalIva');
    const modalTotal = document.getElementById('modalTotal');
    const saveInvoiceButton = document.getElementById('saveInvoice');
    const downloadPDFButton = document.getElementById('downloadPDF');

    // Check if required elements exist
    if (!publicView || !adminView || !clientSelect || !clientInfo || !clientNameSpan || !clientEmailSpan || !productSelect || !productQuantity || !addProductButton || !invoiceTableBody || !subtotalSpan || !ivaSpan || !totalSpan || !generateInvoiceButton || !modalInvoiceTableBody || !modalSubtotal || !modalIva || !modalTotal || !saveInvoiceButton || !downloadPDFButton) {
        console.error('[Facturas] Error: One or more DOM elements not found', {
            publicView: !!publicView,
            adminView: !!adminView,
            clientSelect: !!clientSelect,
            clientInfo: !!clientInfo,
            clientNameSpan: !!clientNameSpan,
            clientEmailSpan: !!clientEmailSpan,
            productSelect: !!productSelect,
            productQuantity: !!productQuantity,
            addProductButton: !!addProductButton,
            invoiceTableBody: !!invoiceTableBody,
            subtotalSpan: !!subtotalSpan,
            ivaSpan: !!ivaSpan,
            totalSpan: !!totalSpan,
            generateInvoiceButton: !!generateInvoiceButton,
            modalInvoiceTableBody: !!modalInvoiceTableBody,
            modalSubtotal: !!modalSubtotal,
            modalIva: !!modalIva,
            modalTotal: !!modalTotal,
            saveInvoiceButton: !!saveInvoiceButton,
            downloadPDFButton: !!downloadPDFButton
        });
        return;
    }

    // Always show admin view for factura functionality (accessible to all users)
    const hasValidSession = localStorage.getItem('adminSession') === 'loggedIn' || localStorage.getItem('vendorSession') === 'loggedIn';
    console.log('[Facturas] hasValidSession:', hasValidSession);
    
    // Show admin view if user has any valid session, otherwise show public view
    publicView.style.display = hasValidSession ? 'none' : 'block';
    adminView.style.display = hasValidSession ? 'block' : 'none';
    console.log('[Facturas] publicView display:', publicView.style.display);
    console.log('[Facturas] adminView display:', adminView.style.display);

    // Populate client select
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });

    // Populate product select
    function updateProductSelect() {
        productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
        products.forEach(product => {
            if (product.quantity > 0) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - $${parseFloat(product.price).toFixed(2)} (Disponible: ${product.quantity})`;
                productSelect.appendChild(option);
            }
        });
    }
    updateProductSelect();

    // Update client info when client is selected
    clientSelect.addEventListener('change', () => {
        const clientId = clientSelect.value;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            clientNameSpan.textContent = client.name;
            clientEmailSpan.textContent = client.email;
            clientInfo.style.display = 'block';
            updateGenerateButton();
        } else {
            clientInfo.style.display = 'none';
        }
    });

    // Add product to invoice
    addProductButton.addEventListener('click', () => {
        const productId = productSelect.value;
        const quantity = parseInt(productQuantity.value);
        const product = products.find(p => p.id === productId);
        if (!productId || !quantity || quantity < 1) {
            showAlert('Por favor, selecciona un producto y una cantidad válida.', 'Campos requeridos', 'warning');
            return;
        }
        if (!product) {
            showAlert('Producto no encontrado.', 'Error', 'error');
            return;
        }
        if (quantity > product.quantity) {
            showAlert(`No hay suficiente inventario. Cantidad disponible: ${product.quantity}`, 'Inventario insuficiente', 'warning');
            return;
        }
        invoiceItems.push({
            productId,
            name: product.name,
            price: parseFloat(product.price),
            quantity,
            amount: parseFloat(product.price) * quantity
        });
        renderInvoiceTable();
        productSelect.value = '';
        productQuantity.value = '';
        updateGenerateButton();
    });

    // Render invoice table
    function renderInvoiceTable() {
        invoiceTableBody.innerHTML = '';
        invoiceItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.amount).toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeInvoiceItem(${index})">Eliminar</button></td>
            `;
            invoiceTableBody.appendChild(row);
        });
        updateTotals();
    }

    // Remove item from invoice
    window.removeInvoiceItem = function (index) {
        invoiceItems.splice(index, 1);
        renderInvoiceTable();
        updateGenerateButton();
    };

    // Update subtotal, IVA, and total
    function updateTotals() {
        const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
        const iva = subtotal * 0.12; // 12% IVA for Ecuador
        const total = subtotal + iva;
        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        ivaSpan.textContent = `$${iva.toFixed(2)}`;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }

    // Enable/disable generate invoice button
    function updateGenerateButton() {
        generateInvoiceButton.disabled = !clientSelect.value || invoiceItems.length === 0;
    }

    // Generate invoice and show modal
    generateInvoiceButton.addEventListener('click', () => {
        const clientId = clientSelect.value;
        const client = clients.find(c => c.id === clientId);
        if (!client) {
            showAlert('Por favor, selecciona un cliente.', 'Cliente requerido', 'warning');
            return;
        }

        // Populate modal
        modalClientName.textContent = client.name;
        modalClientEmail.textContent = client.email;
        modalInvoiceTableBody.innerHTML = '';
        invoiceItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.amount).toFixed(2)}</td>
            `;
            modalInvoiceTableBody.appendChild(row);
        });
        const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
        const iva = subtotal * 0.12;
        const total = subtotal + iva;
        modalSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        modalIva.textContent = `$${iva.toFixed(2)}`;
        modalTotal.textContent = `$${total.toFixed(2)}`;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
        modal.show();
    });

    // Save invoice and update product quantities
    saveInvoiceButton.addEventListener('click', () => {
        const clientId = clientSelect.value;
        const client = clients.find(c => c.id === clientId);
        const invoice = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            clientId,
            clientName: client.name,
            clientEmail: client.email,
            items: invoiceItems,
            subtotal: invoiceItems.reduce((sum, item) => sum + item.amount, 0),
            iva: invoiceItems.reduce((sum, item) => sum + item.amount, 0) * 0.12,
            total: invoiceItems.reduce((sum, item) => sum + item.amount, 0) * 1.12,
            date: new Date().toISOString()
        };

        // Update product quantities
        invoiceItems.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                product.quantity -= item.quantity;
            }
        });
        localStorage.setItem('products', JSON.stringify(products));

        // Save invoice
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Factura guardada', { body: `Factura para ${client.name} guardada exitosamente.` });
        }

        // Reset form
        invoiceItems = [];
        renderInvoiceTable();
        clientSelect.value = '';
        clientInfo.style.display = 'none';
        productSelect.value = '';
        productQuantity.value = '';
        updateProductSelect();
        updateGenerateButton();
        bootstrap.Modal.getInstance(document.getElementById('invoiceModal')).hide();

        // Notify productos.js to refresh (if loaded)
        if (typeof window.initProductos === 'function') {
            window.initProductos();
        }
    });

    // Generate and download PDF invoice
    downloadPDFButton.addEventListener('click', () => {
        const clientId = clientSelect.value;
        const client = clients.find(c => c.id === clientId);
        
        if (!client || invoiceItems.length === 0) {
            showAlert('Error: No hay datos de factura para generar el PDF.', 'Error', 'error');
            return;
        }

        try {
            // Create new jsPDF instance
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Set font
            doc.setFont('helvetica');
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('MUNDO PAPELITO', 20, 30);
            
            doc.setFontSize(14);
            doc.text('FACTURA DE VENTA', 20, 40);
            
            // Company info
            doc.setFontSize(10);
            doc.text('Ciudad alegria, Llano Grande, Calle Cuba y Guatemala', 20, 50);
            doc.text('Teléfono: +593 96 421 0021', 20, 55);
            doc.text('Email: papel@gmail.com', 20, 60);
            
            // Invoice number and date
            const invoiceNumber = '_' + Math.random().toString(36).substr(2, 9);
            const currentDate = new Date().toLocaleDateString('es-ES');
            doc.text(`Factura No: ${invoiceNumber}`, 120, 50);
            doc.text(`Fecha: ${currentDate}`, 120, 55);
            
            // Client info
            doc.setFontSize(12);
            doc.text('DATOS DEL CLIENTE:', 20, 80);
            doc.setFontSize(10);
            doc.text(`Nombre: ${client.name}`, 20, 90);
            doc.text(`Email: ${client.email}`, 20, 95);
            
            // Line separator
            doc.line(20, 105, 190, 105);
            
            // Table headers
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('PRODUCTO', 20, 115);
            doc.text('PRECIO', 80, 115);
            doc.text('CANT.', 120, 115);
            doc.text('TOTAL', 160, 115);
            
            // Line under headers
            doc.line(20, 120, 190, 120);
            
            // Table content
            doc.setFont('helvetica', 'normal');
            let yPosition = 130;
            let subtotal = 0;
            
            invoiceItems.forEach(item => {
                doc.text(item.name.substring(0, 30), 20, yPosition); // Limit product name length
                doc.text(`$${item.price.toFixed(2)}`, 80, yPosition);
                doc.text(item.quantity.toString(), 120, yPosition);
                doc.text(`$${item.amount.toFixed(2)}`, 160, yPosition);
                subtotal += item.amount;
                yPosition += 10;
                
                // Add new page if content is too long
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                }
            });
            
            // Totals
            const iva = subtotal * 0.12;
            const total = subtotal + iva;
            
            yPosition += 10;
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;
            
            doc.setFont('helvetica', 'bold');
            doc.text('SUBTOTAL:', 120, yPosition);
            doc.text(`$${subtotal.toFixed(2)}`, 160, yPosition);
            yPosition += 10;
            
            doc.text('IVA (12%):', 120, yPosition);
            doc.text(`$${iva.toFixed(2)}`, 160, yPosition);
            yPosition += 10;
            
            doc.text('TOTAL:', 120, yPosition);
            doc.text(`$${total.toFixed(2)}`, 160, yPosition);
            
            // Footer
            yPosition += 20;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Gracias por su compra', 20, yPosition);
            doc.text('Esta es una factura generada automáticamente', 20, yPosition + 5);
            
            // Download PDF
            const fileName = `Factura_${client.name.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
            
            console.log('[Facturas] PDF generated and downloaded successfully');
            
        } catch (error) {
            console.error('[Facturas] Error generating PDF:', error);
            showAlert('Error al generar el PDF. Por favor, inténtelo de nuevo.', 'Error', 'error');
        }
    });

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
        console.log('[Facturas] WOW.js initialized');
    } else {
        console.warn('[Facturas] WOW.js not loaded');
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
};