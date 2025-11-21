document.addEventListener('DOMContentLoaded', () => {
    cargarMisPedidos();
});

async function cargarMisPedidos() {
    const container = document.getElementById('orders-container');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    
    // 1. Obtener token del usuario
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.access_token) {
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Debes iniciar sesión para ver tus pedidos.</td></tr>';
        return;
    }

    try {
        // 2. Llamada a la API (GET /orders/me)
        //    Nota: Enviamos el token en el header Authorization
        const response = await fetch('http://localhost:8000/orders/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${usuario.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener pedidos");
        }

        const pedidos = await response.json();

        // 3. Renderizar
        container.innerHTML = ''; // Limpiar "Cargando..."

        if (pedidos.length === 0) {
            // Si no tiene pedidos, mostramos mensaje amigable
            container.parentElement.style.display = 'none'; // Oculta la tabla
            noOrdersMsg.style.display = 'block'; // Muestra el mensaje "sin pedidos"
            return;
        }

        pedidos.forEach(pedido => {
            // Convertir la lista de items ["2 x Lomo", "1 x Bebida"] a HTML con saltos de línea
            const itemsHTML = pedido.items.map(item => `<div>• ${item}</div>`).join('');
            
            // Color del estado (si es 'pagado' verde, si es 'pendiente' amarillo)
            const estadoColor = pedido.status === 'pagado' || pedido.status === 'entregado' ? 'text-success' : 'text-warning';
            const estadoIcono = pedido.status === 'pagado' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-clock"></i>';

            const row = `
                <tr>
                    <td class="text-muted small align-middle">
                        <a href="/src/html/seguimiento.html?id=${pedido._id}" class="text-warning text-decoration-none fw-bold">
                            #${pedido._id.slice(-6).toUpperCase()}
                        </a>
                    </td>
                    <td>
                        ${itemsHTML}
                        <!-- Si agregaste dirección en el desafío, podrías mostrarla aquí también -->
                        ${pedido.address ? `<small class="text-muted d-block mt-1"><i class="fa-solid fa-location-dot"></i> ${pedido.address}</small>` : ''}
                    </td>
                    <td class="fw-bold text-nowrap">
                        $${pedido.total.toLocaleString('es-CL')}
                    </td>
                    <td class="${estadoColor} fw-bold">
                        ${estadoIcono} ${pedido.status.toUpperCase()}
                    </td>
                </tr>
            `;
            container.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar el historial.</td></tr>';
    }
}