document.addEventListener('DOMContentLoaded', () => {
    cargarMisPedidos();
});

async function cargarMisPedidos() {
    const container = document.getElementById('orders-container');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.access_token) {
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Debes iniciar sesión para ver tus pedidos.</td></tr>';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/orders/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${usuario.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            showAlert("Tu sesión ha expirado. Por favor ingresa nuevamente.", "error");
            setTimeout(() => { cerrarSesion(); }, 2000);
            return;
        }

        if (!response.ok) {
            throw new Error("Error al obtener pedidos");
        }

        const pedidos = await response.json();

        container.innerHTML = '';

        if (pedidos.length === 0) {
            container.closest('table').style.display = 'none'; 
            noOrdersMsg.style.display = 'block';
            return;
        }

        container.closest('table').style.display = 'table';
        noOrdersMsg.style.display = 'none';

        pedidos.forEach(pedido => {
            const itemsHTML = pedido.items.map(item => `<div>• ${item}</div>`).join('');
            
            // --- AQUÍ ESTÁ EL CAMBIO QUE PEDISTE ---
            let estadoColor;
            let estadoIcono;
            const status = pedido.status.toLowerCase();

            if (status === 'cancelado') {
                // Caso especial para CANCELADO: Rojo y con X
                estadoColor = 'text-danger';
                estadoIcono = '<i class="fa-solid fa-circle-xmark"></i>';
            } else if (status === 'pagado' || status === 'entregado') {
                // Casos finales exitosos: Verde y Check
                estadoColor = 'text-success';
                estadoIcono = '<i class="fa-solid fa-check-circle"></i>';
            } else {
                // Cualquier otro estado (preparacion, reparto, etc.): Amarillo y Reloj (Como estaba antes)
                estadoColor = 'text-warning';
                estadoIcono = '<i class="fa-solid fa-clock"></i>';
            }
            // ----------------------------------------

            const row = `
                <tr>
                    <td class="text-white small align-middle">
                        ${pedido._id.slice(-6).toUpperCase()}
                    </td>
                    <td class="align-middle">
                        ${itemsHTML}
                        ${pedido.address ? `<small class="text-warning d-block mt-1"><i class="fa-solid fa-location-dot"></i> ${pedido.address}</small>` : ''}
                    </td>
                    <td class="fw-bold text-nowrap align-middle">
                        $${pedido.total.toLocaleString('es-CL')}
                    </td>
                    <td class="${estadoColor} fw-bold align-middle">
                        ${estadoIcono} ${pedido.status.toUpperCase()}
                    </td>
                </tr>
            `;
            container.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Ocurrió un error al cargar tu historial.</td></tr>';
    }
}