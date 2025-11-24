document.addEventListener('DOMContentLoaded', () => {
    // Verificar Admin
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.role !== 'admin') {
        alert("Acceso denegado.");
        window.location.href = "/src/html/principal/index.html";
        return;
    }
    
    cargarReportes();
});

async function cargarReportes() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Obtener el valor del filtro (all, month, week)
    const range = document.getElementById('report-range').value;
    
    // Poner iconos de carga mientras espera
    document.getElementById('stat-total-sales').innerHTML = '<div class="spinner-border spinner-border-sm text-success"></div>';
    
    try {
        // Enviar el filtro en la URL: ?range=week
        const response = await fetch(`http://localhost:8000/reports/stats?range=${range}`, {
            headers: { 'Authorization': `Bearer ${usuario.access_token}` }
        });

        if (response.status === 401) {
            showAlert("Sesión expirada. Reiniciando...", "error");
            setTimeout(cerrarSesion, 2000);
            return;
        }

        if (!response.ok) throw new Error("Error al cargar estadísticas");

        const data = await response.json();

        // 1. Llenar Tarjetas
        document.getElementById('stat-total-sales').textContent = `$${data.total_sales.toLocaleString('es-CL')}`;
        document.getElementById('stat-total-orders').textContent = data.total_orders;
        
        // Calcular activos
        const estados = data.orders_by_status;
        // Sumamos los que no son 'entregado' ni 'cancelado'
        // Nota: Los nombres de las llaves dependen de cómo estén guardados en MongoDB (minusculas)
        const activos = (estados.recibido || 0) + (estados.pagado || 0) + (estados.preparacion || 0) + (estados.reparto || 0);
        document.getElementById('stat-active-orders').textContent = activos;

        // 2. Llenar Tabla Reciente
        const tbody = document.getElementById('recent-orders-table');
        tbody.innerHTML = '';

        if (data.recent_orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay movimientos en este periodo.</td></tr>';
            return;
        }

        data.recent_orders.forEach(order => {
            const fechaObj = order.date ? new Date(order.date) : new Date();
            const fecha = fechaObj.toLocaleDateString();
            
            let badgeClass = 'bg-secondary';
            if (order.status === 'entregado') badgeClass = 'bg-success';
            if (order.status === 'cancelado') badgeClass = 'bg-danger';
            if (['preparacion', 'reparto', 'pagado', 'recibido'].includes(order.status)) badgeClass = 'bg-warning text-dark';

            const row = `
                <tr>
                    <td class="ps-3 font-monospace text-white-50">#${order.id.slice(-6).toUpperCase()}</td>
                    <td class="text-white-50">${fecha}</td>
                    <td><span class="badge ${badgeClass}">${order.status.toUpperCase()}</span></td>
                    <td class="text-end pe-3 fw-bold text-white">$${order.total.toLocaleString('es-CL')}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        document.getElementById('stat-total-sales').textContent = "Error";
        showAlert("No se pudieron cargar los datos.", "error");
    }
}