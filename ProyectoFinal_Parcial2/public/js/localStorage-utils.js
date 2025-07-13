// localStorage Utilities
// Ejecuta estas funciones en la consola del navegador para limpiar datos corruptos

console.log('[LocalStorage Utils] Utilidades de limpieza cargadas');

// Limpiar clientes corruptos
window.cleanClients = function() {
    console.log('🧹 Limpiando clientes del localStorage...');
    
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    console.log('📊 Clientes antes de limpiar:', clients);
    
    const cleanedClients = clients.filter(client => {
        return client && 
               typeof client === 'object' && 
               client.id && 
               client.name && 
               client.email &&
               client.name.trim() !== '' &&
               client.email.trim() !== '';
    });
    
    console.log('✅ Clientes después de limpiar:', cleanedClients);
    console.log('🗑️  Entradas eliminadas:', clients.length - cleanedClients.length);
    
    localStorage.setItem('clients', JSON.stringify(cleanedClients));
    return cleanedClients;
};

// Limpiar productos corruptos
window.cleanProducts = function() {
    console.log('🧹 Limpiando productos del localStorage...');
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    console.log('📊 Productos antes de limpiar:', products);
    
    const cleanedProducts = products.filter(product => {
        return product && 
               typeof product === 'object' && 
               product.id && 
               product.name && 
               typeof product.price === 'number' &&
               typeof product.quantity === 'number' &&
               product.name.trim() !== '';
    });
    
    console.log('✅ Productos después de limpiar:', cleanedProducts);
    console.log('🗑️  Entradas eliminadas:', products.length - cleanedProducts.length);
    
    localStorage.setItem('products', JSON.stringify(cleanedProducts));
    return cleanedProducts;
};

// Limpiar empleados corruptos
window.cleanEmployees = function() {
    console.log('🧹 Limpiando empleados del localStorage...');
    
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    console.log('📊 Empleados antes de limpiar:', employees);
    
    const cleanedEmployees = employees.filter(employee => {
        return employee && 
               typeof employee === 'object' && 
               employee.id && 
               employee.name && 
               employee.email &&
               employee.username &&
               employee.password &&
               employee.name.trim() !== '' &&
               employee.email.trim() !== '';
    });
    
    console.log('✅ Empleados después de limpiar:', cleanedEmployees);
    console.log('🗑️  Entradas eliminadas:', employees.length - cleanedEmployees.length);
    
    localStorage.setItem('employees', JSON.stringify(cleanedEmployees));
    return cleanedEmployees;
};

// Limpiar comentarios corruptos
window.cleanComments = function() {
    console.log('🧹 Limpiando comentarios del localStorage...');
    
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    console.log('📊 Comentarios antes de limpiar:', comments);
    
    const cleanedComments = comments.filter(comment => {
        return comment && 
               typeof comment === 'object' && 
               comment.id && 
               comment.name && 
               comment.email &&
               comment.message &&
               comment.age &&
               comment.timestamp &&
               comment.name.trim() !== '' &&
               comment.email.trim() !== '' &&
               comment.message.trim() !== '';
    });
    
    console.log('✅ Comentarios después de limpiar:', cleanedComments);
    console.log('🗑️  Entradas eliminadas:', comments.length - cleanedComments.length);
    
    localStorage.setItem('comments', JSON.stringify(cleanedComments));
    return cleanedComments;
};

// Limpiar todas las colecciones
window.cleanAllLocalStorage = function() {
    console.log('🚀 Limpiando todas las colecciones del localStorage...');
    
    const results = {
        clients: cleanClients(),
        products: cleanProducts(),
        employees: cleanEmployees(),
        comments: cleanComments()
    };
    
    console.log('✅ Limpieza completa terminada:', results);
    
    // Reinicializar todas las funciones si están disponibles
    if (typeof window.initClientes === 'function') {
        setTimeout(() => window.initClientes(), 100);
    }
    if (typeof window.initProductos === 'function') {
        setTimeout(() => window.initProductos(), 100);
    }
    if (typeof window.initEmpleados === 'function') {
        setTimeout(() => window.initEmpleados(), 100);
    }
    if (typeof window.initOpiniones === 'function') {
        setTimeout(() => window.initOpiniones(), 100);
    }
    
    return results;
};

// Resetear completamente el localStorage (¡CUIDADO!)
window.resetLocalStorage = function() {
    showConfirm('⚠️  ¿Estás seguro de que quieres eliminar TODOS los datos del localStorage? Esta acción NO se puede deshacer.', function() {
        const keys = ['clients', 'products', 'employees', 'comments', 'invoices'];
        keys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️  Eliminado: ${key}`);
        });
        
        console.log('💥 localStorage completamente limpio');
        location.reload(); // Recargar la página
    });
};

// Mostrar información del localStorage
window.showLocalStorageInfo = function() {
    console.log('📊 Información del localStorage:');
    
    const keys = ['clients', 'products', 'employees', 'comments', 'invoices'];
    keys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`${key}:`, data.length, 'entradas');
        
        if (Array.isArray(data) && data.length > 0) {
            const corruptedCount = data.filter(item => {
                return !item || typeof item !== 'object' || !item.id;
            }).length;
            
            if (corruptedCount > 0) {
                console.warn(`⚠️  ${key} tiene ${corruptedCount} entradas corruptas`);
            }
        }
    });
};

// Función para verificar comentarios
window.checkComments = function() {
    console.log('� Verificando comentarios en localStorage...');
    
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    console.log('📊 Comentarios encontrados:', comments.length);
    
    if (comments.length > 0) {
        console.log('✅ Últimos comentarios:');
        comments.slice(0, 3).forEach((comment, index) => {
            console.log(`${index + 1}. ${comment.name} (${comment.email}) - ${new Date(comment.timestamp).toLocaleString()}`);
        });
    } else {
        console.log('❌ No hay comentarios guardados');
    }
    
    return comments;
};

// Función para agregar un comentario de prueba
window.addTestComment = function() {
    console.log('🧪 Agregando comentario de prueba...');
    
    const testComment = {
        id: '_test_' + Date.now(),
        name: 'Usuario de Prueba',
        age: 25,
        email: 'test@ejemplo.com',
        message: 'Este es un comentario de prueba creado automáticamente.',
        coordinates: { latitude: -2.1709, longitude: -79.9224 },
        timestamp: new Date().toISOString()
    };
    
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.unshift(testComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    console.log('✅ Comentario de prueba agregado:', testComment);
    console.log('📊 Total de comentarios ahora:', comments.length);
    
    return testComment;
};

