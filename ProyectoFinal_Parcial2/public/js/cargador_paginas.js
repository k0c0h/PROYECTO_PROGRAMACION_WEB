// public/js/cargador_paginas.js
window.cargarPaginas = function (pagina) {
    const protectedPages = ['pages/productos.html', 'pages/clientes.html'];
    const isProtectedPage = protectedPages.includes(pagina);

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

            // Inicializar el formulario de login si se cargó login.html
            if (url.includes('login.html') && typeof window.initLogin === 'function') {
                setTimeout(() => {
                    window.initLogin();
                    console.log('[Cargador] initLogin called for login.html');
                }, 200);
            }

            // Inicializar productos si se cargó productos.html
            if (url.includes('productos.html') && typeof window.initProductos === 'function') {
                setTimeout(() => {
                    window.initProductos();
                    console.log('[Cargador] initProductos called for productos.html');
                }, 200);
            }

            // Inicializar clientes si se cargó clientes.html
            if (url.includes('clientes.html') && typeof window.initClientes === 'function') {
                setTimeout(() => {
                    window.initClientes();
                    console.log('[Cargador] initClientes called for clientes.html');
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