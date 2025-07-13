// login.js
console.log('[Login] Script loaded');

// Función para obtener información del empleado actual
window.getCurrentEmployee = function() {
    const currentEmployee = localStorage.getItem('currentEmployee');
    if (currentEmployee) {
        return JSON.parse(currentEmployee);
    }
    return null;
};

// Función para logout mejorada
window.logout = function() {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('vendorSession');
    localStorage.removeItem('currentEmployee');
    console.log('[Login] Sesión cerrada');
    window.location.href = '../login/login.html';
};

// Solicitar permisos de notificación al cargar el script
if ('Notification' in window) {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('[Login] Notification permission:', permission);
        });
    }
    console.log('[Login] Current notification permission:', Notification.permission);
} else {
    console.warn('[Login] Browser does not support notifications');
}

window.initLogin = function () {
    console.log('[Login] initLogin called, initializing login form');

    const adminLoginForm = document.getElementById('adminLoginForm');
    if (!adminLoginForm) {
        console.log('[Login] No login form found, skipping initialization');
        return;
    }

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    if (!usernameInput || !passwordInput || !errorMessage) {
        console.error('[Login] Error: One or more form elements not found', {
            usernameInput: !!usernameInput,
            passwordInput: !!passwordInput,
            errorMessage: !!errorMessage
        });
        errorMessage.textContent = 'Error: Elementos del formulario no encontrados.';
        errorMessage.style.display = 'block';
        return;
    }

    adminLoginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('[Login] Form submitted');

        const username = usernameInput.value;
        const password = passwordInput.value;
        console.log('[Login] Username entered:', username);
        console.log('[Login] Password entered:', password);

        // Credenciales de administrador y vendedor (reemplazar con autenticación segura en producción)
        const adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        const vendorCredentials = {
            username: 'vendedor',
            password: 'vendedor123'
        };

        // Obtener empleados del localStorage
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        console.log('[Login] Checking employees from localStorage:', employees);

        // Buscar empleado con las credenciales ingresadas
        const employeeMatch = employees.find(emp => 
            emp.username === username && emp.password === password
        );

        if (username === adminCredentials.username && password === adminCredentials.password) {
            console.log('[Login] Admin credentials are valid, setting adminSession in localStorage');
            localStorage.setItem('adminSession', 'loggedIn');
            localStorage.removeItem('vendorSession'); // Remove vendor session if exists

            // Mostrar notificación de éxito
            console.log('[Login] Attempting to show notification');
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    console.log('[Login] Permission granted, showing notification');
                    new Notification('¡Inicio de sesión exitoso!', {
                        body: 'Bienvenido al panel de administración de Mundo Papelito.',
                        icon: './public/img/favicon.ico'
                    });
                } else if (Notification.permission === 'default') {
                    console.log('[Login] Requesting notification permission');
                    Notification.requestPermission().then(permission => {
                        console.log('[Login] Permission response:', permission);
                        if (permission === 'granted') {
                            new Notification('¡Inicio de sesión exitoso!', {
                                body: 'Bienvenido al panel de administración de Mundo Papelito.',
                                icon: './public/img/favicon.ico'
                            });
                        }
                    });
                } else {
                    console.log('[Login] Notification permission denied');
                }
            } else {
                console.warn('[Login] Browser does not support notifications');
            }

            // Actualizar botones de navegación
            if (typeof updateNavButtons === 'function') {
                updateNavButtons();
                console.log('[Login] Navbar buttons updated');
            }

            // Redirigir a la página principal de admin
            console.log('[Login] Redirecting to admin index page');
            window.location.href = '../paginaAdmin/indexAdmin.html';
            
        } else if (username === vendorCredentials.username && password === vendorCredentials.password) {
            console.log('[Login] Vendor credentials are valid, setting vendorSession in localStorage');
            localStorage.setItem('vendorSession', 'loggedIn');
            localStorage.removeItem('adminSession'); // Remove admin session if exists

            // Mostrar notificación de éxito
            console.log('[Login] Attempting to show notification');
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    console.log('[Login] Permission granted, showing notification');
                    new Notification('¡Inicio de sesión exitoso!', {
                        body: 'Bienvenido al panel de vendedor de Mundo Papelito.',
                        icon: './public/img/favicon.ico'
                    });
                } else if (Notification.permission === 'default') {
                    console.log('[Login] Requesting notification permission');
                    Notification.requestPermission().then(permission => {
                        console.log('[Login] Permission response:', permission);
                        if (permission === 'granted') {
                            new Notification('¡Inicio de sesión exitoso!', {
                                body: 'Bienvenido al panel de vendedor de Mundo Papelito.',
                                icon: './public/img/favicon.ico'
                            });
                        }
                    });
                } else {
                    console.log('[Login] Notification permission denied');
                }
            } else {
                console.warn('[Login] Browser does not support notifications');
            }

            // Actualizar botones de navegación
            if (typeof updateNavButtons === 'function') {
                updateNavButtons();
                console.log('[Login] Navbar buttons updated');
            }

            // Redirigir a la página principal de vendedor
            console.log('[Login] Redirecting to vendor index page');
            window.location.href = '../paginaVendedor/indexVendedor.html';
            
        } else if (employeeMatch) {
            // Verificar si el empleado es administrador o vendedor
            console.log('[Login] Employee match found:', employeeMatch);
            
            if (employeeMatch.position === 'Administrador') {
                console.log('[Login] Employee is admin, setting adminSession in localStorage');
                localStorage.setItem('adminSession', 'loggedIn');
                localStorage.removeItem('vendorSession');
                
                // Guardar información del empleado actual
                localStorage.setItem('currentEmployee', JSON.stringify(employeeMatch));
                
                // Mostrar notificación de éxito
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('¡Inicio de sesión exitoso!', {
                        body: `Bienvenido ${employeeMatch.name} - Panel de Administración`,
                        icon: './public/img/favicon.ico'
                    });
                }
                
                // Actualizar botones de navegación
                if (typeof updateNavButtons === 'function') {
                    updateNavButtons();
                }
                
                // Redirigir a la página principal de admin
                console.log('[Login] Redirecting employee admin to admin index page');
                window.location.href = '../paginaAdmin/indexAdmin.html';
                
            } else if (employeeMatch.position === 'Vendedor') {
                console.log('[Login] Employee is vendor, setting vendorSession in localStorage');
                localStorage.setItem('vendorSession', 'loggedIn');
                localStorage.removeItem('adminSession');
                
                // Guardar información del empleado actual
                localStorage.setItem('currentEmployee', JSON.stringify(employeeMatch));
                
                // Mostrar notificación de éxito
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('¡Inicio de sesión exitoso!', {
                        body: `Bienvenido ${employeeMatch.name} - Panel de Vendedor`,
                        icon: './public/img/favicon.ico'
                    });
                }
                
                // Actualizar botones de navegación
                if (typeof updateNavButtons === 'function') {
                    updateNavButtons();
                }
                
                // Redirigir a la página principal de vendedor
                console.log('[Login] Redirecting employee vendor to vendor index page');
                window.location.href = '../paginaVendedor/indexVendedor.html';
                
            } else {
                console.log('[Login] Employee has invalid position:', employeeMatch.position);
                errorMessage.textContent = 'El cargo del empleado no permite el acceso al sistema.';
                errorMessage.style.display = 'block';
            }
            
        } else {
            console.log('[Login] Invalid credentials');
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            errorMessage.style.display = 'block';
        }
    });
};