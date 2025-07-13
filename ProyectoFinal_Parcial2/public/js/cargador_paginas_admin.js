window.cargarPaginas = function (pagina) {
    const protectedPages = ['pages/productos.html', 'pages/clientes.html', 'pages/facturas.html'];
    const isProtectedPage = protectedPages.includes(pagina);

    if (isProtectedPage && !localStorage.getItem('adminSession')) {
        console.warn('[Cargador] Acceso denegado, redirigiendo a login');
        pagina = 'pages/login.html';
    }

    let url;
    if (pagina === 'index') {
        url = './inicio.html';
    } else if (pagina === 'pages/productos.html') {
        // Usar productosadmin.html para administradores
        url = './productosadmin.html';
    } else if (pagina === 'pages/clientes.html') {
        // Usar clientes.html para administradores
        url = './clientes.html';
    } else if (pagina === 'pages/empleados.html') {
        // Usar empleados.html para administradores
        url = './empleados.html';
    } else if (pagina === 'pages/facturas.html') {
        // Usar facturas.html para administradores
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

            // Inicializar productos si se cargó productosadmin.html
            if (url.includes('productosadmin.html') && typeof window.initProductos === 'function') {
                setTimeout(() => {
                    window.initProductos();
                    console.log('[Cargador] initProductos called for productosadmin.html');
                }, 200);
            }

            // Inicializar clientes si se cargó clientes.html
            if (url.includes('clientes.html') && typeof window.initClientes === 'function') {
                setTimeout(() => {
                    window.initClientes();
                    console.log('[Cargador] initClientes called for clientes.html');
                }, 200);
            }

            // Inicializar empleados si se cargó empleados.html
            if (url.includes('empleados.html') && typeof window.initEmpleados === 'function') {
                setTimeout(() => {
                    window.initEmpleados();
                    console.log('[Cargador] initEmpleados called for empleados.html');
                }, 200);
            }

            // Inicializar facturas si se cargó facturas.html
            if (url.includes('facturas.html') && typeof window.initFacturas === 'function') {
                setTimeout(() => {
                    window.initFacturas();
                    console.log('[Cargador] initFacturas called for facturas.html');
                }, 200);
            }

            // Inicializar opiniones si se cargó opiniones.html
            if (url.includes('opiniones.html') && typeof window.initOpiniones === 'function') {
                setTimeout(() => {
                    window.initOpiniones();
                    console.log('[Cargador] initOpiniones called for opiniones.html');
                }, 200);
            }

            // Inicializar contact si se cargó contact.html
            if (url.includes('contact.html') && typeof window.initContact === 'function') {
                setTimeout(() => {
                    window.initContact();
                    console.log('[Cargador] initContact called for contact.html');
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
