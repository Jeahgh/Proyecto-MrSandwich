document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar resumen visual al iniciar
    cargarResumenCompra();
    
    // 2. Configurar el botón de pago
    const btnPagar = document.getElementById('btn-finalizar-compra');
    if(btnPagar) {
        btnPagar.addEventListener('click', procesarPago);
    }

    // 3. LOGICA DE PAGO (Tarjeta vs Local) - Mostrar/Ocultar formulario
    const radioTarjeta = document.getElementById('pagoTarjeta');
    const radioLocal = document.getElementById('pagoLocal');
    const formTarjeta = document.getElementById('form-tarjeta-container');
    const msgPagoLocal = document.getElementById('msg-pago-local');

    function toggleFormPago() {
        if (radioTarjeta.checked) {
            formTarjeta.style.display = 'block';
            if (msgPagoLocal) msgPagoLocal.style.display = 'none';
        } else {
            formTarjeta.style.display = 'none';
            if (msgPagoLocal) msgPagoLocal.style.display = 'block';
        }
    }
    
    if(radioTarjeta && radioLocal) {
        radioTarjeta.addEventListener('change', toggleFormPago);
        radioLocal.addEventListener('change', toggleFormPago);
        // Ejecutar una vez al inicio para establecer estado correcto
        toggleFormPago();
    }

    // 4. LOGICA DE ENTREGA (Retiro vs Delivery) - Estilos y campo dirección
    const btnRetiro = document.getElementById('btn-retiro');
    const btnDelivery = document.getElementById('btn-delivery');
    const direccionContainer = document.getElementById('direccion-container');
    const containerPagoLocal = document.getElementById('container-pago-local'); 
    
    if (btnRetiro && btnDelivery) {
        btnRetiro.addEventListener('click', () => {
            // Estilos visuales (activo/inactivo)
            btnRetiro.classList.add('active', 'btn-light');
            btnRetiro.classList.remove('btn-outline-light');
            
            btnDelivery.classList.remove('active', 'btn-light');
            btnDelivery.classList.add('btn-outline-light');

            // Ocultar campo de dirección
            if (direccionContainer) direccionContainer.style.display = 'none';

            // Lógica de Negocio: Si es Retiro, permitimos "Pago en Local"
            if (containerPagoLocal) {
                containerPagoLocal.style.display = 'block';
            }
        });

        btnDelivery.addEventListener('click', () => {
            // Estilos visuales
            btnDelivery.classList.add('active', 'btn-light');
            btnDelivery.classList.remove('btn-outline-light');
            
            btnRetiro.classList.remove('active', 'btn-light');
            btnRetiro.classList.add('btn-outline-light');

            // Mostrar campo de dirección
            if (direccionContainer) direccionContainer.style.display = 'block';

            // Lógica de Negocio: Si es Delivery, NO permitimos "Pago en Local" (solo Tarjeta)
            if (containerPagoLocal) {
                containerPagoLocal.style.display = 'none';
            }
            
            // Forzamos selección de Tarjeta si estaba en Local
            if (radioLocal && radioLocal.checked) {
                radioTarjeta.checked = true;
                toggleFormPago(); // Actualizamos la UI
            }
        });
    }
});


// --- FUNCIÓN: DIBUJAR RESUMEN DE COMPRA ---
function cargarResumenCompra() {
    // Usamos la función global de modelo.js para leer el localStorage
    const carrito = obtenerCarrito(); 
    
    const contenedorItems = document.getElementById('resumen-items');
    const contenedorTotal = document.getElementById('resumen-total');
    const btnPagar = document.getElementById('btn-finalizar-compra');

    // Validación: Carrito Vacío
    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p class="text-danger text-center py-3">No hay productos para pagar.</p>';
        contenedorTotal.textContent = '$0';
        if (btnPagar) {
            btnPagar.disabled = true;
            btnPagar.textContent = "Carrito Vacío";
        }
        return;
    }

    // Dibujar Items
    contenedorItems.innerHTML = ''; 
    let totalCalculado = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalCalculado += subtotal;

        // HTML para cada fila del resumen
        const itemHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
                <div class="d-flex align-items-center gap-3">
                    <!-- Cantidad destacada (Badge Amarillo) -->
                    <span class="badge bg-warning text-dark fs-6 rounded-pill">
                        ${item.cantidad}x
                    </span>
                    <!-- Nombre y Precio -->
                    <div>
                        <div class="fw-bold text-white" style="font-size: 1.05rem;">
                            ${item.nombre}
                        </div>
                        <div class="text-white small">
                            $${item.precio.toLocaleString('es-CL')} c/u
                        </div>
                    </div>
                </div>
                <!-- Subtotal -->
                <span class="fw-bold text-warning fs-5">
                    $${subtotal.toLocaleString('es-CL')}
                </span>
            </div>
        `;
        contenedorItems.innerHTML += itemHTML;
    });

    // Mostrar Total Final
    contenedorTotal.textContent = `$${totalCalculado.toLocaleString('es-CL')}`;
}


// --- FUNCIÓN: PROCESAR PAGO Y CREAR ORDEN ---
async function procesarPago() {
    const btnPagar = document.getElementById('btn-finalizar-compra');
    
    // 1. Validar Usuario Logueado (Token)
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.email) {
        showAlert("Debes iniciar sesión para comprar", "error");
        return;
    }

    // 2. Detectar Método de Entrega y Dirección
    const btnDelivery = document.getElementById('btn-delivery');
    const esDelivery = btnDelivery && btnDelivery.classList.contains('active');
    const direccionInput = document.getElementById('input-direccion');
    
    let direccionFinal = "Retiro en Tienda"; // Valor por defecto

    if (esDelivery) {
        const direccionTexto = direccionInput.value.trim();
        if (!direccionTexto) {
            showAlert("Por favor, ingresa una dirección para el delivery.", "error");
            direccionInput.focus();
            return;
        }
        direccionFinal = direccionTexto; // Guardamos la dirección real
    }

    // 3. Validar Datos de Pago (Simulación)
    const esPagoTarjeta = document.getElementById('pagoTarjeta').checked;
    let metodoPagoTexto = "Pago en Local";
    
    if (esPagoTarjeta) {
        metodoPagoTexto = "Tarjeta Crédito/Débito";
        
        // Campos del formulario de tarjeta
        const num = document.getElementById('card-number').value;
        const exp = document.getElementById('card-expiry').value;
        const cvv = document.getElementById('card-cvv').value;
        const name = document.getElementById('card-name').value;

        // Validación simple: que no estén vacíos
        if (!num || !exp || !cvv || !name) {
            showAlert("Completa los datos de la tarjeta.", "error");
            return;
        }
        // Validación simple: longitud mínima de tarjeta
        if (num.length < 16) {
            showAlert("El número de tarjeta es inválido.", "error");
            return;
        }
    }

    // 4. Preparar Envío al Backend
    btnPagar.disabled = true;
    btnPagar.textContent = "Procesando pago...";

    const carrito = obtenerCarrito();
    const totalFinal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear lista de items legible para la BD
    const listaItems = carrito.map(item => `${item.cantidad} x ${item.nombre}`);

    // Objeto Order (Coincide con models.py del Backend)
    const ordenData = {
        user_id: usuario.email,
        items: listaItems,
        total: totalFinal,
        status: "pagado",     // Asumimos pago exitoso
        payment_method: metodoPagoTexto,
        address: direccionFinal,
        // delivery_person se deja vacío (lo asigna el admin después)
    };

    try {
        // 5. Fetch al Backend (Crear Orden)
        const response = await fetch("http://localhost:8000/orders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ordenData)
        });

        if (!response.ok) throw new Error("Error al procesar el pedido");

        // 6. Éxito
        const ordenCreada = await response.json();
        console.log("Orden creada:", ordenCreada);

        // 7. Limpiar y Redirigir
        localStorage.removeItem("carrito"); // Borramos el carrito local
        actualizarIconoCarrito(); // Actualizamos el badge a 0 (función de modelo.js)
        
        // Redirigir a la página de Éxito
        window.location.href = "/src/html/exito.html";

    } catch (error) {
        console.error(error);
        showAlert("Ocurrió un error al conectar con el servidor.", "error");
        btnPagar.disabled = false;
        btnPagar.textContent = "Confirmar y Pagar";
    }
}