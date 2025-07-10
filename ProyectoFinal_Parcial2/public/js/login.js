// login.js
console.log('[Login] Script loaded');

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

        // Credenciales de administrador (reemplazar con autenticación segura en producción)
        const adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        if (username === adminCredentials.username && password === adminCredentials.password) {
            console.log('[Login] Credentials are valid, setting adminSession in localStorage');
            localStorage.setItem('adminSession', 'loggedIn');

            // Mostrar notificación de éxito
            if (Notification.permission === 'granted') {
                new Notification('¡Inicio de sesión exitoso!', {
                    body: 'Bienvenido al panel de administración de Mundo Papelito.'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('¡Inicio de sesión exitoso!', {
                            body: 'Bienvenido al panel de administración de Mundo Papelito.'
                        });
                    }
                });
            }

            // Actualizar botones de navegación
            if (typeof updateNavButtons === 'function') {
                updateNavButtons();
                console.log('[Login] Navbar buttons updated');
            }

            // Redirigir a la página de productos
            if (typeof cargarPaginas === 'function') {
                cargarPaginas('pages/productos.html');
            } else {
                console.error('[Login] Error: cargarPaginas is not defined');
                errorMessage.textContent = 'Error: No se puede redirigir. La función cargarPaginas no está definida.';
                errorMessage.style.display = 'block';
            }
        } else {
            console.log('[Login] Invalid credentials');
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            errorMessage.style.display = 'block';
        }
    });
};