window.cargarPaginas = function (pagina) {
    const protectedPages = ['pages/productos.html', 'pages/clientes.html', 'pages/facturas.html'];
    const publicPages = ['pages/productosindex.html']; // Páginas públicas que no requieren autenticación
    const isProtectedPage = protectedPages.includes(pagina);
    const isPublicPage = publicPages.includes(pagina);

    if (isProtectedPage && !localStorage.getItem('adminSession')) {
        console.warn('[Cargador] Acceso denegado, redirigiendo a login');
        pagina = 'pages/login.html';
    }

    let url;
    if (pagina === 'index') {
        url = './public/pages/inicio.html';
    } else if (pagina.includes('/')) {
        url = './public/' + pagina;
    } else {
        url = './public/pages/' + pagina;
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

            // Inicializar contact si se cargó contact.html
            if (url.includes('contact.html') && typeof window.initContact === 'function') {
                setTimeout(() => {
                    window.initContact();
                }, 200);
            }

            // Inicializar el formulario de login si se cargó login.html
            if (url.includes('login.html') && typeof window.initLogin === 'function') {
                setTimeout(() => {
                    window.initLogin();
                    console.log('[Cargador] initLogin called for login.html');
                }, 200);
            }

            // Inicializar productos si se cargó productos.html o productosindex.html
            if ((url.includes('productos.html') || url.includes('productosindex.html')) && typeof window.initProductos === 'function') {
                setTimeout(() => {
                    // Set a flag for public access if loading productosindex.html
                    if (url.includes('productosindex.html')) {
                        window.isPublicProductAccess = true;
                        console.log('[Cargador] Setting public product access flag');
                    } else {
                        window.isPublicProductAccess = false;
                    }
                    
                    window.initProductos();
                    console.log('[Cargador] initProductos called for productos page');
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
    fetch('./public/pages/inicio.html')
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