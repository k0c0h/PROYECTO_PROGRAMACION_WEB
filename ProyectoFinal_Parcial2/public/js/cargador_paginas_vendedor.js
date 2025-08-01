window.cargarPaginas = function (pagina) {
    const protectedPages = ['pages/productos.html', 'pages/clientes.html', 'pages/facturas.html'];
    const isProtectedPage = protectedPages.includes(pagina);

    if (isProtectedPage && !localStorage.getItem('adminSession') && !localStorage.getItem('vendorSession')) {
        console.warn('[Cargador] Acceso denegado, redirigiendo a login');
        pagina = 'pages/login.html';
    }

    let url;
    if (pagina === 'index') {
        url = './inicio.html';
    } else if (pagina === 'pages/productos.html') {
        // Usar productosvendedor.html para vendedores
        url = './productosvendedor.html';
    } else if (pagina === 'pages/clientes.html') {
        // Usar clientes.html para vendedores
        url = './clientes.html';
    } else if (pagina === 'pages/facturas.html') {
        // Usar facturas.html para vendedores
        url = './facturas.html';
    } else if (pagina.includes('/')) {
        url = '../' + pagina;
    } else if (pagina.endsWith('.html')) {
        // Si es un archivo HTML en la misma carpeta
        url = './' + pagina;
    } else {
        url = '../pages/' + pagina;
    }

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error('Página no encontrada: ' + url);
            }
            console.log('[Cargador] Successfully fetched:', url);
            return res.text();
        })
        .then(data => {
            document.getElementById('contenedorprincipal').innerHTML = data;

            // Reinicializar carousels
            if (typeof initializeCarousels === 'function') {
                initializeCarousels();
            }

            // Inicializar geolocalización para la página de contacto
            if (url.includes('contact.html') && typeof initGeolocation === 'function') {
                setTimeout(() => {
                    initGeolocation();
                }, 200);
            }

            // Inicializar productos si se cargó productosvendedor.html
            if (url.includes('productosvendedor.html') && typeof window.initProductos === 'function') {
                setTimeout(() => {
                    window.initProductos();
                    console.log('[Cargador] initProductos called for productosvendedor.html');
                }, 200);
            }

            // Inicializar clientes si se cargó clientes.html
            if (url.includes('clientes.html') && typeof window.initClientes === 'function') {
                setTimeout(() => {
                    window.initClientes();
                    console.log('[Cargador] initClientes called for clientes.html');
                }, 200);
            }

            // Inicializar facturas si se cargó facturas.html
            if (url.includes('facturas.html') && typeof window.initFacturas === 'function') {
                setTimeout(() => {
                    window.initFacturas();
                    console.log('[Cargador] initFacturas called for facturas.html');
                }, 200);
            }
        })
        .catch(error => {
            console.error('[Cargador] Error cargando la página:', error);
            document.getElementById('contenedorprincipal').innerHTML = '<p>Error cargando la página: ' + error.message + '</p>';
        });
};

// Cargar página de inicio al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch('./inicio.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('contenedorprincipal').innerHTML = data;
            if (typeof initializeCarousels === 'function') {
                initializeCarousels();
            }
        })
        .catch(error => {
            console.error('[Cargador] Error cargando la página de inicio:', error);
            document.getElementById('contenedorprincipal').innerHTML = '<p>Error cargando la página de inicio</p>';
        });
});
