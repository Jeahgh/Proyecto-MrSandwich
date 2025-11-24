let todosLosPedidos = []; // Guardamos los pedidos aquí para filtrar rápido

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si es admin
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.role !== 'admin') {
        alert("Acceso denegado.");
        window.location.href = "/src/html/principal/index.html";
        return;
    }

    // Cargar datos
    cargarPedidosAdmin();

    // Listeners para filtros
    document.getElementById('filtro-texto').addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
});

async function cargarPedidosAdmin() {
    const tbody = document.getElementById('tabla-pedidos');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Cargando...</td></tr>';
    
    try {
        const response = await fetch('http://localhost:8000/orders/');
        if (!response.ok) throw new Error("Error al cargar");
        
        todosLosPedidos = await response.json();
        
        // Dibujamos la tabla inicial
        renderizarTabla(todosLosPedidos);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-5">Error de conexión.</td></tr>';
    }
}

function aplicarFiltros() {
    const texto = document.getElementById('filtro-texto').value.toLowerCase();
    const estado = document.getElementById('filtro-estado').value;

    const pedidosFiltrados = todosLosPedidos.filter(pedido => {
        // Filtro de Texto (Busca en ID, Email o Dirección)
        const coincideTexto = 
            pedido._id.toLowerCase().includes(texto) ||
            pedido.user_id.toLowerCase().includes(texto) ||
            (pedido.address && pedido.address.toLowerCase().includes(texto));

        // Filtro de Estado
        let coincideEstado = true;
        if (estado === 'activos') {
            coincideEstado = pedido.status !== 'entregado' && pedido.status !== 'cancelado';
        } else if (estado !== 'todos') {
            coincideEstado = pedido.status === estado;
        }

        return coincideTexto && coincideEstado;
    });

    renderizarTabla(pedidosFiltrados);
}

function renderizarTabla(pedidos) {
    const tbody = document.getElementById('tabla-pedidos');
    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-white py-5">No se encontraron pedidos.</td></tr>';
        return;
    }

    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.created_at).toLocaleString('es-CL');
        
        // Generar Select de Estado
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

        const itemsLista = pedido.items.map(i => `<div>• ${i}</div>`).join('');

        const row = `
            <tr>
                <td>
                    <span class="badge-id">#${pedido._id.slice(-6).toUpperCase()}</span>
                </td>
                <td>
                    <div class="fw-bold text-white">${pedido.user_id}</div>
                    <div class="text-subtle"><i class="fa-regular fa-clock me-1"></i> ${fecha}</div>
                    <div class="text-subtle"><i class="fa-solid fa-location-dot me-1"></i> ${pedido.address || 'Retiro'}</div>
                </td>
                <td class="text-white-50 small">${itemsLista}</td>
                <td class="fw-bold text-warning">$${pedido.total.toLocaleString('es-CL')}</td>
                <td style="width: 180px;">${estadoSelect}</td>
                <td style="width: 220px;">${repartidorInput}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
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
            // Actualizamos el objeto en la memoria para que el filtro siga funcionando bien
            const p = todosLosPedidos.find(x => x._id === id);
            if(p) p.status = nuevoEstado;
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
            const p = todosLosPedidos.find(x => x._id === id);
            if(p) p.delivery_person = nombreRepartidor;
        } else {
            throw new Error("Error");
        }
    } catch (error) {
        showAlert("Error al asignar", "error");
    }
}