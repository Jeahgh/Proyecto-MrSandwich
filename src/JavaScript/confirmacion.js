document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar resumen
    cargarResumenCompra();
    
    // 2. Botón de pago
    const btnPagar = document.getElementById('btn-finalizar-compra');
    if(btnPagar) {
        btnPagar.addEventListener('click', procesarPago);
    }

    // 3. LOGICA DE PAGO (Tarjeta vs Local)
    const radioTarjeta = document.getElementById('pagoTarjeta');
    const radioLocal = document.getElementById('pagoLocal');
    const formTarjeta = document.getElementById('form-tarjeta-container');
    const msgPagoLocal = document.getElementById('msg-pago-local');

    function toggleFormPago() {
        if (radioTarjeta.checked) {
            formTarjeta.style.display = 'block';
            msgPagoLocal.style.display = 'none';
        } else {
            formTarjeta.style.display = 'none';
            msgPagoLocal.style.display = 'block';
        }
    }
    
    if(radioTarjeta && radioLocal) {
        radioTarjeta.addEventListener('change', toggleFormPago);
        radioLocal.addEventListener('change', toggleFormPago);
        toggleFormPago(); 
    }

    // 4. LOGICA DE ENTREGA (Retiro vs Delivery)
    const btnRetiro = document.getElementById('btn-retiro');
    const btnDelivery = document.getElementById('btn-delivery');
    const direccionContainer = document.getElementById('direccion-container');
    const containerPagoLocal = document.getElementById('container-pago-local'); // El div de la opción "Pago local"
    
    if (btnRetiro && btnDelivery) {
        btnRetiro.addEventListener('click', () => {
            // Estilos visuales
            btnRetiro.classList.add('active', 'btn-light');
            btnRetiro.classList.remove('btn-outline-light');
            btnDelivery.classList.remove('active', 'btn-light');
            btnDelivery.classList.add('btn-outline-light');

            // Ocultar dirección
            direccionContainer.style.display = 'none';

            // == CAMBIO LÓGICO: MOSTRAR OPCIÓN "PAGO LOCAL" ==
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

            // Mostrar dirección
            direccionContainer.style.display = 'block';

            // == CAMBIO LÓGICO: OCULTAR OPCIÓN "PAGO LOCAL" Y FORZAR TARJETA ==
            if (containerPagoLocal) {
                containerPagoLocal.style.display = 'none';
            }
            
            // Si estaba seleccionado "Local", forzamos el cambio a "Tarjeta"
            if (radioLocal.checked) {
                radioTarjeta.checked = true;
                // Forzamos la actualización visual del formulario de tarjeta
                toggleFormPago();
            }
        });
    }
});


// --- FUNCIÓN: DIBUJAR RESUMEN ---
function cargarResumenCompra() {
    const carrito = obtenerCarrito(); 
    const contenedorItems = document.getElementById('resumen-items');
    const contenedorTotal = document.getElementById('resumen-total');
    const btnPagar = document.getElementById('btn-finalizar-compra');

    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p class="text-danger text-center py-3">No hay productos para pagar.</p>';
        contenedorTotal.textContent = '$0';
        if (btnPagar) {
            btnPagar.disabled = true;
            btnPagar.textContent = "Carrito Vacío";
        }
        return;
    }

    contenedorItems.innerHTML = ''; 
    let totalCalculado = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalCalculado += subtotal;

        const itemHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-warning text-dark fs-6 rounded-pill">
                        ${item.cantidad}x
                    </span>
                    <div>
                        <div class="fw-bold text-white" style="font-size: 1.05rem;">
                            ${item.nombre}
                        </div>
                        <div class="text-white small">
                            $${item.precio.toLocaleString('es-CL')} c/u
                        </div>
                    </div>
                </div>
                <span class="fw-bold text-white fs-5">
                    $${subtotal.toLocaleString('es-CL')}
                </span>
            </div>
        `;
        contenedorItems.innerHTML += itemHTML;
    });

    contenedorTotal.textContent = `$${totalCalculado.toLocaleString('es-CL')}`;
}


// --- FUNCIÓN: PROCESAR PAGO ---
async function procesarPago() {
    const btnPagar = document.getElementById('btn-finalizar-compra');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.email) {
        showAlert("Debes iniciar sesión para comprar", "error");
        return;
    }

    // Validar Método de Entrega
    const esDelivery = document.getElementById('btn-delivery').classList.contains('active');
    const direccionInput = document.getElementById('input-direccion').value;

    if (esDelivery && !direccionInput.trim()) {
        showAlert("Por favor, ingresa una dirección para el delivery.", "error");
        document.getElementById('input-direccion').focus();
        return;
    }

    // Validar Pago
    const esPagoTarjeta = document.getElementById('pagoTarjeta').checked;
    let metodoPagoTexto = "Pago en Local";
    
    if (esPagoTarjeta) {
        metodoPagoTexto = "Tarjeta Crédito/Débito";
        const num = document.getElementById('card-number').value;
        const exp = document.getElementById('card-expiry').value;
        const cvv = document.getElementById('card-cvv').value;
        const name = document.getElementById('card-name').value;

        if (!num || !exp || !cvv || !name) {
            showAlert("Completa los datos de la tarjeta.", "error");
            return;
        }
    }

    btnPagar.disabled = true;
    btnPagar.textContent = "Procesando...";

    const carrito = obtenerCarrito();
    const totalFinal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const listaItems = carrito.map(item => `${item.cantidad} x ${item.nombre}`);

    let direccionFinal = "Retiro en Tienda";
    if (esDelivery) {
        direccionFinal = `Delivery: ${direccionInput}`;
    }

    // Añadimos la dirección al objeto de la orden (aunque el backend no la guarde en campo aparte, va en el objeto)
    const ordenData = {
        user_id: usuario.email,
        items: listaItems,
        total: totalFinal,
        status: "pagado",
        adress: direccionFinal,
        payment_method: metodoPagoTexto
    };

    try {
        const response = await fetch("http://localhost:8000/orders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ordenData)
        });

        if (!response.ok) throw new Error("Error al procesar");

        const ordenCreada = await response.json();
        console.log("Orden creada:", ordenCreada);

        showAlert(`¡Pedido Exitoso! (${metodoPagoTexto})`, "ok");

        localStorage.removeItem("carrito");
        actualizarIconoCarrito(); 
        
        setTimeout(() => {
            window.location.href = "/src/html/principal/index.html";
        }, 2500);

    } catch (error) {
        console.error(error);
        showAlert("Error al conectar con el servidor.", "error");
        btnPagar.disabled = false;
        btnPagar.textContent = "Confirmar y Pagar";
    }
}