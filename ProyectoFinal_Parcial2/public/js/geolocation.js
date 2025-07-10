// Función para obtener la geolocalización del usuario
function initGeolocation() {
    const iframe = document.querySelector('#map-iframe');
    
    if (!iframe) {
        console.log('El iframe del mapa no está presente en esta página');
        return;
    }

    console.log('Iniciando geolocalización...');

    // Verificar si la geolocalización está disponible
    if ("geolocation" in navigator) {
        // Mostrar mensaje de carga
        iframe.src = "data:text/html;charset=utf-8,<div style='display: flex; justify-content: center; align-items: center; height: 100%; font-family: Arial, sans-serif; color: #06BBCC;'><p>🌍 Obteniendo tu ubicación...</p></div>";
        
        // Opciones para la geolocalización
        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // Aumentado a 15 segundos
            maximumAge: 300000 // 5 minutos
        };

        // Obtener la posición actual
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Generar URL de Google Maps con la ubicación
                const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=${lat},${lng}&zoom=16`;
                
                // Actualizar el iframe con la ubicación
                iframe.src = mapUrl;
                
                console.log(`✅ Ubicación obtenida: ${lat}, ${lng}`);
            },
            function(error) {
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "🚫 Permiso de ubicación denegado";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "📍 Ubicación no disponible";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "⏱️ Tiempo de espera agotado";
                        break;
                    default:
                        errorMessage = "❌ Error desconocido";
                        break;
                }
                
                console.warn("Error de geolocalización:", errorMessage);
                
                // Mostrar mensaje de error en el iframe
                iframe.src = `data:text/html;charset=utf-8,<div style='display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-family: Arial, sans-serif; color: #dc3545; text-align: center; padding: 20px;'><p><strong>${errorMessage}</strong></p><p style='color: #6c757d; font-size: 14px; margin-top: 10px;'>Mostrando ubicación de nuestra tienda</p></div>`;
                
                // Fallback a ubicación predeterminada (tu tienda)
                setTimeout(() => {
                    iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=Ciudad+Alegría,+Llano+Grande,+Quito,+Ecuador&zoom=16";
                }, 3000);
            },
            options
        );
    } else {
        console.error("❌ Geolocalización no soportada por el navegador");
        
        // Mostrar mensaje de no disponible
        iframe.src = "data:text/html;charset=utf-8,<div style='display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-family: Arial, sans-serif; color: #dc3545; text-align: center; padding: 20px;'><p><strong>🚫 Geolocalización no disponible</strong></p><p>Tu navegador no soporta geolocalización</p><p style='color: #6c757d; font-size: 14px; margin-top: 10px;'>Mostrando ubicación de nuestra tienda</p></div>";
        
        // Fallback a ubicación predeterminada
        setTimeout(() => {
            iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=Ciudad+Alegría,+Llano+Grande,+Quito,+Ecuador&zoom=16";
        }, 3000);
    }
}

// Función para recargar la ubicación
function reloadLocation() {
    console.log('🔄 Recargando ubicación...');
    initGeolocation();
}