// Cargar página de inicio al cargar la página
fetch('./public/pages/inicio.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('contenedorprincipal').innerHTML = data;
        // Reinicializar carousels después de cargar el contenido
        initializeCarousels();
    });

function cargarPaginas(pagina) {
    let url;
    
    if (pagina === 'index') {
        url = './public/pages/inicio.html';
    } else if (pagina.includes('/')) {
        url = './public/' + pagina;
    } else {
        url = './public/pages/' + pagina;
    }
    
    fetch(url)
        .then(res => res.text())
        .then(data => {
            document.getElementById('contenedorprincipal').innerHTML = data;
            
            // Reinicializar carousels después de cargar el contenido
            initializeCarousels();
            
            // Verificar si se cargó la página de contacto e inicializar geolocalización
            if (url.includes('contact.html')) {
                // Esperar un poco para que el DOM se actualice completamente
                setTimeout(() => {
                    if (typeof initGeolocation === 'function') {
                        initGeolocation();
                    }
                }, 200);
            }
        })
        .catch(error => {
            console.error('Error cargando la página:', error);
            document.getElementById('contenedorprincipal').innerHTML = '<p>Error cargando la página</p>';
        });
}
