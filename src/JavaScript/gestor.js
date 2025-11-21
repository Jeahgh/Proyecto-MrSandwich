document.addEventListener('DOMContentLoaded', () => {
    // Verificar si es admin
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.role !== 'admin') {
        alert("Acceso restringido.");
        window.location.href = "/src/html/principal/index.html";
        return;
    }

    cargarPedidosAdmin();
});

async function cargarPedidosAdmin() {
    const tbody = document.getElementById('tabla-pedidos');
    
    try {
        const response = await fetch('http://localhost:8000/orders/');
        if (!response.ok) throw new Error("Error al cargar pedidos");
        const pedidos = await response.json();

        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">No hay pedidos activos.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            // Fecha
            const fecha = new Date(pedido.created_at).toLocaleString('es-CL');

            // Select de Estado (LIMPIO, SIN EMOJIS)
            const estadoSelect = `
                <select class="form-select form-select-sm form-select-dark" onchange="actualizarEstado('${pedido._id}', this.value)">
                    <option value="recibido" ${pedido.status === 'recibido' || pedido.status === 'pagado' ? 'selected' : ''}>Recibido</option>
                    <option value="preparacion" ${pedido.status === 'preparacion' ? 'selected' : ''}>En Preparación</option>
                    <option value="reparto" ${pedido.status === 'reparto' ? 'selected' : ''}>En Reparto</option>
                    <option value="entregado" ${pedido.status === 'entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            `;

            // Input Repartidor
            const repartidorVal = pedido.delivery_person || '';
            const repartidorInput = `
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-dark" 
                           value="${repartidorVal}" 
                           id="rep-${pedido._id}" placeholder="Nombre...">
                    <button class="btn btn-outline-warning" onclick="asignarRepartidor('${pedido._id}')">
                        <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                </div>
            `;

            // Items (Lista con guiones simples)
            const itemsLista = pedido.items.map(i => `<div>- ${i}</div>`).join('');

            const row = `
                <tr>
                    <td>
                        <span class="badge-id">#${pedido._id.slice(-6).toUpperCase()}</span>
                        <div class="text-subtle">${fecha}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-white">${pedido.user_id}</div>
                        <div class="text-subtle">${pedido.address || 'Retiro en tienda'}</div>
                    </td>
                    <td class="text-white-50 small">${itemsLista}</td>
                    <td class="fw-bold text-warning">$${pedido.total.toLocaleString('es-CL')}</td>
                    <td style="width: 180px;">${estadoSelect}</td>
                    <td style="width: 220px;">${repartidorInput}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-5">Error de conexión.</td></tr>';
    }
}

async function actualizarEstado(id, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:8000/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nuevoEstado })
        });
        
        if (response.ok) {
            showAlert(`Estado actualizado`, "ok");
        } else {
            throw new Error("Error");
        }
    } catch (error) {
        showAlert("Error al actualizar", "error");
    }
}

async function asignarRepartidor(id) {
    const nombreRepartidor = document.getElementById(`rep-${id}`).value;
    
    try {
        const response = await fetch(`http://localhost:8000/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delivery_person: nombreRepartidor })
        });

        if (response.ok) {
            showAlert(`Repartidor asignado`, "ok");
        } else {
            throw new Error("Error");
        }
    } catch (error) {
        showAlert("Error al asignar", "error");
    }
}