// Modal Manager - Reemplaza alerts con Bootstrap Modals
console.log('[Modal Manager] Script loaded');

// Crear el modal HTML dinámicamente
function createAlertModal() {
    // Verificar si ya existe
    if (document.getElementById('alertModal')) {
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="alertModalLabel">
                            <i id="alertModalIcon" class="fa fa-info-circle me-2"></i>
                            <span id="alertModalTitle">Información</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p id="alertModalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="alertModalButton">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insertar el modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Crear el modal de confirmación
function createConfirmModal() {
    // Verificar si ya existe
    if (document.getElementById('confirmModal')) {
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmModalLabel">
                            <i class="fa fa-question-circle me-2 text-warning"></i>
                            Confirmación
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p id="confirmModalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="confirmModalCancel">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmModalAccept">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insertar el modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para mostrar alert como modal
window.showAlert = function(message, title = 'Información', type = 'info') {
    createAlertModal();
    
    const modal = document.getElementById('alertModal');
    const modalTitle = document.getElementById('alertModalTitle');
    const modalMessage = document.getElementById('alertModalMessage');
    const modalIcon = document.getElementById('alertModalIcon');
    const modalButton = document.getElementById('alertModalButton');

    // Configurar el contenido
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Configurar el icono y estilo según el tipo
    switch(type) {
        case 'success':
            modalIcon.className = 'fa fa-check-circle me-2 text-success';
            modalButton.className = 'btn btn-success';
            break;
        case 'error':
            modalIcon.className = 'fa fa-exclamation-triangle me-2 text-danger';
            modalButton.className = 'btn btn-danger';
            break;
        case 'warning':
            modalIcon.className = 'fa fa-exclamation-circle me-2 text-warning';
            modalButton.className = 'btn btn-warning';
            break;
        default:
            modalIcon.className = 'fa fa-info-circle me-2 text-primary';
            modalButton.className = 'btn btn-primary';
    }

    // Mostrar el modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
};

// Función para mostrar confirm como modal
window.showConfirm = function(message, onConfirm, onCancel = null, title = 'Confirmación') {
    createConfirmModal();
    
    const modal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('confirmModalMessage');
    const modalAccept = document.getElementById('confirmModalAccept');
    const modalCancel = document.getElementById('confirmModalCancel');

    // Configurar el contenido
    document.getElementById('confirmModalLabel').innerHTML = `<i class="fa fa-question-circle me-2 text-warning"></i>${title}`;
    modalMessage.textContent = message;

    // Limpiar eventos anteriores
    const newAcceptBtn = modalAccept.cloneNode(true);
    const newCancelBtn = modalCancel.cloneNode(true);
    modalAccept.parentNode.replaceChild(newAcceptBtn, modalAccept);
    modalCancel.parentNode.replaceChild(newCancelBtn, modalCancel);

    // Agregar eventos
    newAcceptBtn.addEventListener('click', function() {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
        if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', function() {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
        if (onCancel) onCancel();
    });

    // Mostrar el modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
};

// Reemplazar la función alert global (opcional)
// window.alert = showAlert;

console.log('[Modal Manager] Functions loaded: showAlert(), showConfirm()');
