document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (orderId) {
        cargarVistaDetalle(orderId);
    } else {
        cargarVistaLista();
    }
});

// --- NAVEGACIÓN ---
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

// --- MODO LISTA ---
async function cargarVistaLista() {
    mostrarSeccion('view-list');
    const container = document.getElementById('active-orders-container');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.access_token) {
        container.innerHTML = '<div class="alert alert-dark text-center">Inicia sesión para ver el seguimiento.</div>';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/orders/me', {
            headers: { 'Authorization': `Bearer ${usuario.access_token}` }
        });

        if (!response.ok) throw new Error("Error al conectar");

        const pedidos = await response.json();
        // Filtramos solo los activos
        const activos = pedidos.filter(p => p.status !== 'entregado' && p.status !== 'cancelado');

        container.innerHTML = '';

        if (activos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-check-circle fs-1 mb-3 opacity-50"></i>
                    <p>No tienes pedidos pendientes.</p>
                    <a href="/src/html/principal/carta.html" class="btn btn-warning btn-sm mt-2 text-dark fw-bold">Hacer un pedido</a>
                </div>
            `;
            return;
        }

        activos.forEach(p => {
            const card = `
                <div class="card bg-dark border-secondary shadow-sm mb-2" onclick="irADetalle('${p._id}')" style="cursor: pointer; transition: 0.2s;">
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
        container.innerHTML = '<p class="text-danger text-center">No pudimos cargar tus pedidos.</p>';
    }
}

// --- MODO DETALLE ---
async function cargarVistaDetalle(id) {
    mostrarSeccion('view-detail');
    
    try {
        const response = await fetch(`http://localhost:8000/orders/${id}`);
        if (!response.ok) throw new Error("Pedido no encontrado");
        
        const pedido = await response.json();

        // 1. Rellenar Datos (Verificamos que los elementos existan para evitar el error null)
        const elId = document.getElementById('detail-id');
        const elDate = document.getElementById('detail-date');
        const elAddress = document.getElementById('detail-address');
        const elPayment = document.getElementById('detail-payment');

        if (elId) elId.textContent = `#${pedido._id.slice(-6).toUpperCase()}`;
        if (elDate) elDate.textContent = new Date(pedido.created_at).toLocaleString();
        if (elAddress) elAddress.textContent = pedido.address || "Retiro en tienda";
        if (elPayment) elPayment.textContent = pedido.payment_method || "Estándar";

        // Badge estado
        const badgeContainer = document.getElementById('status-badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = `<span class="badge bg-warning text-dark fs-6">${pedido.status.toUpperCase()}</span>`;
        }

        // Repartidor
        const delInfo = document.getElementById('delivery-info');
        if (delInfo) {
            if (pedido.delivery_person) {
                delInfo.innerHTML = `<span class="text-warning">Repartidor: ${pedido.delivery_person}</span>`;
            } else {
                delInfo.textContent = "Tu pedido va en camino.";
            }
        }

        // 2. Línea de Tiempo
        actualizarLineaTiempo(pedido.status);

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