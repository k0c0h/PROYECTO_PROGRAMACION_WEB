console.log('[Empleados] Script loaded');

window.initEmpleados = function () {
    console.log('[Empleados] initEmpleados called, initializing employees');

    // Initial employee data with proper values
    const initialEmployees = [
        {
            id: '_emp1',
            name: 'Usuario',
            email: 'user1@gmail.com',
            position: 'Vendedor',
            username: 'user',
            password: 'user123',
            photo: '../../img/images.png'
        },

    ];

    // Initialize employees in localStorage if empty
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    if (employees.length === 0) {
        employees = initialEmployees;
        localStorage.setItem('employees', JSON.stringify(employees));
        console.log('[Empleados] Initial employees loaded:', employees.length);
    } else {
        // Migrate existing employees to include username/password if they don't have them
        let updated = false;
        employees = employees.map(employee => {
            // Verificar que el empleado tenga las propiedades necesarias
            if (!employee || !employee.name || !employee.email) {
                console.warn('[Empleados] Skipping invalid employee:', employee);
                return employee;
            }
            
            if (!employee.username || !employee.password) {
                const nameParts = employee.name.toLowerCase().split(' ');
                const defaultUsername = nameParts[0] + '.' + (nameParts[1] || nameParts[0]);
                updated = true;
                return {
                    ...employee,
                    username: employee.username || defaultUsername,
                    password: employee.password || 'password123'
                };
            }
            return employee;
        });
        
        // Filtrar empleados válidos
        employees = employees.filter(employee => 
            employee && employee.name && employee.email && employee.position
        );
        
        if (updated) {
            localStorage.setItem('employees', JSON.stringify(employees));
            console.log('[Empleados] Employees migrated with username/password');
        }
    }

    // Get DOM elements
    const publicView = document.getElementById('publicView');
    const adminView = document.getElementById('adminView');
    const publicEmployeeList = document.getElementById('publicEmployeeList');
    const employeeError = document.getElementById('employeeError');
    const employeeForm = document.getElementById('employeeForm');
    const employeeTableBody = document.getElementById('employeeTableBody');

    // Check if essential elements exist
    if (!publicView || !adminView || !publicEmployeeList || !employeeError) {
        console.error('[Empleados] Error: Essential DOM elements not found');
        return;
    }

    // Toggle views based on admin session
    const isAdmin = localStorage.getItem('adminSession') === 'loggedIn';
    publicView.style.display = isAdmin ? 'none' : 'block';
    adminView.style.display = isAdmin ? 'block' : 'none';

    // Public view: Render employees
    function renderPublicEmployees() {
        console.log('[Empleados] Rendering public employees');
        publicEmployeeList.innerHTML = '';
        
        if (employees.length === 0) {
            employeeError.textContent = 'No hay empleados disponibles.';
            employeeError.style.display = 'block';
            return;
        }
        
        employees.forEach((employee, index) => {
            if (employee && employee.name && employee.email && employee.position) {
                const delay = (index % 4) * 0.2 + 0.1;
                const div = document.createElement('div');
                div.className = `col-lg-3 col-md-6 wow fadeInUp`;
                div.setAttribute('data-wow-delay', `${delay}s`);
                div.innerHTML = `
                    <div class="team-item bg-light">
                        <div class="overflow-hidden">
                            <img class="img-fluid" src="${employee.photo || '../../img/images.png'}" alt="${employee.name}">
                        </div>
                        <div class="text-center p-4">
                            <h5 class="mb-0">${employee.name}</h5>
                            <small>
                                <p><strong>Cargo:</strong> ${employee.position}</p>
                                <p><strong>Email:</strong> ${employee.email}</p>
                            </small>
                        </div>
                    </div>
                `;
                publicEmployeeList.appendChild(div);
            }
        });
        
        employeeError.style.display = 'none';
        console.log('[Empleados] Public employees rendered successfully');
    }

    // Admin view: Render employee table
    function renderAdminEmployees() {
        if (!localStorage.getItem('adminSession') || !employeeTableBody) {
            return;
        }
        
        console.log('[Empleados] Rendering admin employees');
        employeeTableBody.innerHTML = '';
        
        employees.forEach(employee => {
            if (employee && employee.name && employee.email && employee.position) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.email}</td>
                    <td><span class="badge bg-primary">${employee.position}</span></td>
                    <td><strong>${employee.username || 'N/A'}</strong></td>
                    <td><span class="text-muted">••••••••</span></td>
                    <td><img src="${employee.photo || '../../img/images.png'}" class="img-fluid" style="max-height: 50px;" alt="Empleado"></td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2" onclick="editEmployee('${employee.id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${employee.id}')">Eliminar</button>
                    </td>
                `;
                employeeTableBody.appendChild(row);
            }
        });
        console.log('[Empleados] Admin employees rendered successfully');
    }

    // Get other DOM elements for form functionality
    const employeePhoto = document.getElementById('employeePhoto');
    const employeePhotoPreview = document.getElementById('employeePhotoPreview');
    const cancelEditButton = document.getElementById('cancelEdit');
    const startCameraButton = document.getElementById('startCamera');
    const capturePhotoButton = document.getElementById('capturePhoto');
    const employeeCamera = document.getElementById('employeeCamera');
    const employeeCanvas = document.getElementById('employeeCanvas');
    const togglePasswordButton = document.getElementById('togglePassword');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    const employeePasswordInput = document.getElementById('employeePassword');

    // Password toggle functionality
    if (togglePasswordButton && togglePasswordIcon && employeePasswordInput) {
        togglePasswordButton.addEventListener('click', function() {
            const type = employeePasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            employeePasswordInput.setAttribute('type', type);
            
            if (type === 'text') {
                togglePasswordIcon.classList.remove('fa-eye');
                togglePasswordIcon.classList.add('fa-eye-slash');
            } else {
                togglePasswordIcon.classList.remove('fa-eye-slash');
                togglePasswordIcon.classList.add('fa-eye');
            }
        });
    }

    // Camera handling
    let stream = null;

    if (startCameraButton && capturePhotoButton && employeeCamera && employeeCanvas) {
        // Start camera
        startCameraButton.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                employeeCamera.srcObject = stream;
                employeeCamera.style.display = 'block';
                capturePhotoButton.style.display = 'block';
                startCameraButton.style.display = 'none';
            } catch (error) {
                console.error('[Empleados] Error accessing camera:', error);
                if (employeeError) {
                    employeeError.textContent = 'Error al acceder a la cámara: ' + error.message;
                    employeeError.style.display = 'block';
                }
            }
        });

        // Capture photo
        capturePhotoButton.addEventListener('click', () => {
            const context = employeeCanvas.getContext('2d');
            employeeCanvas.width = employeeCamera.videoWidth;
            employeeCanvas.height = employeeCamera.videoHeight;
            context.drawImage(employeeCamera, 0, 0, employeeCanvas.width, employeeCanvas.height);
            const imageDataUrl = employeeCanvas.toDataURL('image/jpeg');
            if (employeePhotoPreview) {
                employeePhotoPreview.src = imageDataUrl;
                employeePhotoPreview.style.display = 'block';
            }
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            employeeCamera.style.display = 'none';
            capturePhotoButton.style.display = 'none';
            startCameraButton.style.display = 'block';
        });
    }

    // Handle file input for image
    if (employeePhoto && employeePhotoPreview) {
        employeePhoto.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    employeePhotoPreview.src = e.target.result;
                    employeePhotoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Generate unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // Handle form submission
    if (employeeForm) {
        employeeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('employeeId').value || generateId();
            const name = document.getElementById('employeeName').value;
            const email = document.getElementById('employeeEmail').value;
            const position = document.getElementById('employeePosition').value;
            const username = document.getElementById('employeeUsername').value;
            const password = document.getElementById('employeePassword').value;
            const photo = employeePhotoPreview ? employeePhotoPreview.src : '';

            const employee = { id, name, email, position, username, password, photo };

            if (document.getElementById('employeeId').value) {
                // Edit existing employee
                const index = employees.findIndex(e => e.id === id);
                if (index !== -1) {
                    employees[index] = employee;
                }
            } else {
                // Add new employee
                employees.push(employee);
            }

            // Save to localStorage
            localStorage.setItem('employees', JSON.stringify(employees));

            // Reset form
            employeeForm.reset();
            if (employeePhotoPreview) employeePhotoPreview.style.display = 'none';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            document.getElementById('employeeId').value = '';

            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                if (employeeCamera) employeeCamera.style.display = 'none';
                if (capturePhotoButton) capturePhotoButton.style.display = 'none';
                if (startCameraButton) startCameraButton.style.display = 'block';
            }

            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Empleado guardado', { body: `${name} ha sido guardado exitosamente.` });
            }

            // Refresh views
            renderPublicEmployees();
            renderAdminEmployees();
        });
    }

    // Edit employee function
    window.editEmployee = function (id) {
        if (localStorage.getItem('adminSession') !== 'loggedIn') {
            return;
        }
        
        const employee = employees.find(e => e.id === id);
        if (!employee) return;
        
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeEmail').value = employee.email;
        document.getElementById('employeePosition').value = employee.position;
        document.getElementById('employeeUsername').value = employee.username || '';
        document.getElementById('employeePassword').value = employee.password || '';
        
        if (employee.photo && employeePhotoPreview) {
            employeePhotoPreview.src = employee.photo;
            employeePhotoPreview.style.display = 'block';
        }
        if (cancelEditButton) cancelEditButton.style.display = 'block';
    };

    // Delete employee function
    window.deleteEmployee = function (id) {
        if (localStorage.getItem('adminSession') !== 'loggedIn') {
            return;
        }
        
        showConfirm('¿Estás seguro de eliminar este empleado?', function() {
            employees = employees.filter(e => e.id !== id);
            localStorage.setItem('employees', JSON.stringify(employees));
            renderPublicEmployees();
            renderAdminEmployees();
            if (Notification.permission === 'granted') {
                new Notification('Empleado eliminado', { body: 'El empleado ha sido eliminado.' });
            }
        });
    };

    // Cancel edit
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            employeeForm.reset();
            if (employeePhotoPreview) employeePhotoPreview.style.display = 'none';
            cancelEditButton.style.display = 'none';
            document.getElementById('employeeId').value = '';
            
            // Stop camera if active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                if (employeeCamera) employeeCamera.style.display = 'none';
                if (capturePhotoButton) capturePhotoButton.style.display = 'none';
                if (startCameraButton) startCameraButton.style.display = 'block';
            }
        });
    }

    // Initial render
    renderPublicEmployees();
    renderAdminEmployees();

    // Initialize WOW.js for animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    console.log('[Empleados] Initialization completed successfully');
};
