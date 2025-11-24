document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (orderId) {
        cargarVistaDetalle(orderId);
    } else {
        cargarVistaLista();
    }
});

function mostrarSeccion(seccionId) {
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById(seccionId).style.display = 'block';
}

function volverALista() {
    window.history.pushState({}, document.title, window.location.pathname);
    cargarVistaLista();
}

window.irADetalle = function(id) {
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({path: newUrl}, '', newUrl);
    cargarVistaDetalle(id);
}

// --- VISTA LISTA ---
async function cargarVistaLista() {
    mostrarSeccion('view-list');
    const container = document.getElementById('active-orders-container');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.access_token) {
        container.innerHTML = '<div class="alert alert-dark text-center">Inicia sesión para ver tus pedidos.</div>';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/orders/me', {
            headers: { 'Authorization': `Bearer ${usuario.access_token}` }
        });

        if (response.status === 401) {
             container.innerHTML = '<p class="text-danger text-center">Sesión expirada.</p>';
             return;
        }
        
        if (!response.ok) throw new Error("Error al conectar");

        const pedidos = await response.json();
        const activos = pedidos.filter(p => p.status !== 'entregado' && p.status !== 'cancelado');

        container.innerHTML = '';

        if (activos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-check-circle fs-1 mb-3 opacity-25"></i>
                    <p>No tienes pedidos en curso.</p>
                    <a href="/src/html/principal/carta.html" class="btn btn-warning btn-sm mt-2 text-dark fw-bold">Hacer un pedido</a>
                </div>
            `;
            return;
        }

        activos.forEach(p => {
            const card = `
                <div class="card bg-dark border-secondary shadow-sm mb-2" onclick="irADetalle('${p._id}')" style="cursor: pointer;">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-warning text-dark">EN CURSO</span>
                                <h6 class="text-white m-0">Orden #${p._id.slice(-6).toUpperCase()}</h6>
                            </div>
                            <small class="text-muted d-block mt-1">${new Date(p.created_at).toLocaleString()}</small>
                        </div>
                        <i class="fa-solid fa-chevron-right text-muted"></i>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-danger text-center">Error al cargar pedidos.</p>';
    }
}

// --- VISTA DETALLE ---
async function cargarVistaDetalle(id) {
    mostrarSeccion('view-detail');
    
    try {
        const response = await fetch(`http://localhost:8000/orders/${id}`);
        
        if (response.status === 404) throw new Error("Pedido no encontrado");
        if (!response.ok) throw new Error("Error de conexión");
        
        const pedido = await response.json();

        // 1. Rellenar Datos
        document.getElementById('detail-id').textContent = `#${pedido._id.slice(-6).toUpperCase()}`;
        document.getElementById('detail-date').textContent = new Date(pedido.created_at).toLocaleString();
        document.getElementById('detail-address').textContent = pedido.address || "Retiro en tienda";
        document.getElementById('detail-payment').textContent = pedido.payment_method || "Pago estándar";

        // Badge estado
        const badgeContainer = document.getElementById('status-badge-container');
        badgeContainer.innerHTML = `<span class="badge bg-secondary text-light border border-secondary">${pedido.status.toUpperCase()}</span>`;

        // Repartidor
        const delInfo = document.getElementById('delivery-info');
        if (pedido.delivery_person) {
            delInfo.innerHTML = `<span class="text-warning">Repartidor: ${pedido.delivery_person}</span>`;
        } else {
            delInfo.textContent = "Tu pedido va en camino.";
        }

        // 2. Línea de Tiempo
        actualizarLineaTiempo(pedido.status);

        // 3. Botones de Acción
        generarBotonesAccion(pedido);

    } catch (err) {
        console.error(err);
        alert("No pudimos cargar la información de la orden.");
        volverALista();
    }
}

function actualizarLineaTiempo(estadoActual) {
    const pasos = ['recibido', 'preparacion', 'reparto', 'entregado'];
    let estado = estadoActual.toLowerCase();
    if (estado === 'pagado') estado = 'recibido';

    let alcanzado = true;

    pasos.forEach(paso => {
        const el = document.getElementById(`step-${paso}`);
        if (!el) return;

        el.classList.remove('active', 'completed');

        if (alcanzado) {
            if (paso === estado) {
                el.classList.add('active'); // Actual
                alcanzado = false;
            } else {
                el.classList.add('completed'); // Pasado
            }
        }
    });
}

function generarBotonesAccion(pedido) {
    const container = document.getElementById('action-buttons-container');
    // Mantenemos el botón de volver
    container.innerHTML = `
        <button onclick="volverALista()" class="btn btn-outline-secondary btn-sm">
            <i class="fa-solid fa-arrow-left me-1"></i> Volver
        </button>
    `;

    // Botón CANCELAR (Solo si está en etapa temprana)
    if (pedido.status === 'recibido' || pedido.status === 'pagado') {
        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-outline-danger btn-sm';
        btnCancel.innerHTML = '<i class="fa-solid fa-ban me-2"></i>Cancelar Pedido';
        btnCancel.onclick = () => cancelarPedido(pedido._id);
        container.appendChild(btnCancel);
    }

    // Botón BOLETA (Si no está cancelado)
    if (pedido.status !== 'cancelado') {
        const btnBoleta = document.createElement('button');
        btnBoleta.className = 'btn btn-outline-light btn-sm';
        btnBoleta.innerHTML = '<i class="fa-solid fa-file-invoice me-2"></i>Boleta';
        btnBoleta.onclick = () => descargarBoletaSimulada(pedido._id);
        container.appendChild(btnBoleta);
    }
}

async function cancelarPedido(id) {
    if(!confirm("¿Estás seguro de que quieres cancelar este pedido?")) return;

    try {
        const response = await fetch(`http://localhost:8000/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelado' })
        });

        if (response.ok) {
            showAlert("Pedido cancelado exitosamente.", "ok");
            cargarVistaDetalle(id); // Recargar
        } else {
            throw new Error("Error al cancelar");
        }
    } catch (error) {
        showAlert("No se pudo cancelar el pedido.", "error");
    }
}

function descargarBoletaSimulada(id) {
    alert(`Descargando boleta para el pedido #${id.slice(-6).toUpperCase()}...`);
}