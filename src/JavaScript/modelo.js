// ========== ALERTAS ========== //
function showAlert(msg, type = "ok") {
  const box = document.getElementById("app-alert");
  if (!box) return; // Si no existe, no hagas nada
  box.textContent = msg;
  box.className = type;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}


// ========== AUTENTICACIÓN (Registro) ========== //
async function registrarse(event) {
  event.preventDefault();
  let name = document.getElementById("nameRegister").value;
  let email = document.getElementById("emailRegister").value;
  let pass = document.getElementById("passRegister").value;

  if (pass.length < 6) {
    showAlert("La contraseña debe tener mínimo 6 caracteres","error");
    return;
  }
  const data = { full_name: name, email, password: pass };

  try {
    const response = await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.detail || "No se pudo crear usuario","error");
      return;
    }
    showAlert("Usuario creado con éxito!","ok");
    const modal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
    modal.hide();
  } catch (err) {
    console.error(err);
    showAlert("Error al conectar con backend","error");
  }
}


// ========== AUTENTICACIÓN (Login) ========== //
async function iniciarSesion(event) {
  event.preventDefault();
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  const data = { email, password: pass };

  try {
    const response = await fetch("http://localhost:8000/users/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.detail || "Credenciales incorrectas","error");
      return;
    }
    const result = await response.json(); 

    localStorage.setItem("usuario", JSON.stringify({
      access_token: result.access_token,
      email: email, 
      role: result.role 
    }));
    showAlert("Bienvenido!","ok");
    const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    modal.hide();
    location.reload();
  } catch (err) {
    console.error(err);
    showAlert("Error al conectar con backend","error");
  }
}


// ========== AUTENTICACIÓN (Logout) ========== //
function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("carrito"); // Limpia el carrito al salir
  showAlert("Sesión cerrada","ok");
  location.reload();
}


// ===============================================
// === LÓGICA DEL CARRITO (v6) ===
// ===============================================

// --- Funciones de "Bajo Nivel" (Leer y Guardar) ---

// Lee el carrito desde el "cajón" (localStorage)
function obtenerCarrito() {
  const carritoString = localStorage.getItem('carrito');
  return carritoString ? JSON.parse(carritoString) : [];
}

// Guarda el carrito en el "cajón" y actualiza la vista
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  // Cada vez que guardamos, actualizamos todo
  actualizarIconoCarrito();
  actualizarVistaCarrito();
}

// --- Funciones de "Alto Nivel" (Controlan la Interfaz) ---

// Dibuja el HTML del carrito en el Offcanvas
function actualizarVistaCarrito() {
  // Busca los 4 elementos clave del HTML
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalContainer = document.getElementById('cart-total-container');
  const cartPayButtonContainer = document.getElementById('cart-pay-button-container');
  const cartEmptyMsg = document.getElementById('cart-empty-msg');

  if (!cartItemsContainer) return; // Si no está en la página, no hace nada

  const carrito = obtenerCarrito();
  cartItemsContainer.innerHTML = ''; // Limpia la lista (pero no el msg de vacío)
  let total = 0;

  if (carrito.length === 0) {
    // --- Carrito Vacío ---
    if (cartEmptyMsg) cartEmptyMsg.style.display = 'block';
    cartTotalContainer.innerHTML = ''; // Limpia el total
    if (cartPayButtonContainer) cartPayButtonContainer.style.display = 'none'; // Oculta el botón
  } else {
    // --- Carrito con Items ---
    if (cartEmptyMsg) cartEmptyMsg.style.display = 'none'; // Oculta msg de vacío

    carrito.forEach(item => {
      // 1. Dibuja cada item con el nuevo estilo y botones
      const itemHTML = `
        <div class="cart-item">
          <!-- Info (Nombre y Precio Total del Item) -->
          <div class="cart-item-info">
            <span class="item-name">${item.nombre}</span>
            <span class="item-total-price">$${(item.cantidad * item.precio).toLocaleString('es-CL')}</span>
          </div>

          <!-- Controles (Cantidad y Quitar) -->
          <div class="cart-item-controls-row">
            <div class="cart-item-controls">
              <button class="btn btn-quantity" onclick="decrementarCantidad('${item.id}')" aria-label="Decrementar">-</button>
              <span class="quantity">${item.cantidad}</span>
              <button class="btn btn-quantity" onclick="incrementarCantidad('${item.id}')" aria-label="Incrementar">+</button>
            </div>
            <button class="cart-item-remove-link" onclick="eliminarDelCarrito('${item.id}')">Quitar</button>
          </div>
        </div>
      `;
      cartItemsContainer.innerHTML += itemHTML;
      
      // 2. Suma al total
      total += item.cantidad * item.precio;
    });

    // 3. Dibuja el total
    cartTotalContainer.innerHTML = `
      <span class="total-label">Total:</span>
      <span class="total-price">$${total.toLocaleString('es-CL')}</span>
    `;
    // 4. Muestra el botón de pagar
    if (cartPayButtonContainer) cartPayButtonContainer.style.display = 'block';
  }
}

// Dibuja el contador rojo en el ícono del carrito
function actualizarIconoCarrito() {
    const carrito = obtenerCarrito();
    // Suma la cantidad total de items
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0); 
    const cartIcon = document.querySelector('.fa-cart-shopping');
    if (!cartIcon) return;

    // Borra el contador viejo
    const oldBadge = cartIcon.parentElement.querySelector('.badge');
    if (oldBadge) oldBadge.remove();

    // Si hay items, crea el contador nuevo
    if (totalItems > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-danger rounded-pill ms-1';
        badge.style.fontSize = '0.6em';
        badge.textContent = totalItems;
        cartIcon.parentElement.appendChild(badge);
    }
}

// --- Funciones de "Control" (Se llaman con 'onclick') ---

// Se llama al hacer clic en el botón "+"
function incrementarCantidad(productoId) {
  const carrito = obtenerCarrito();
  const item = carrito.find(p => p.id === productoId);
  if (item) {
    item.cantidad++;
    guardarCarrito(carrito); // Guarda y redibuja
  }
}

// Se llama al hacer clic en el botón "-"
function decrementarCantidad(productoId) {
  let carrito = obtenerCarrito();
  const item = carrito.find(p => p.id === productoId);
  
  if (item) {
    item.cantidad--;
    if (item.cantidad <= 0) {
      // Si la cantidad es 0, lo saca de la lista
      carrito = carrito.filter(p => p.id !== productoId);
    }
    guardarCarrito(carrito); // Guarda y redibuja
  }
}

// Se llama al hacer clic en "Quitar"
function eliminarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  // Saca el producto de la lista, sin importar la cantidad
  carrito = carrito.filter(item => item.id !== productoId);
  guardarCarrito(carrito); // Guarda y redibuja
}

// Se llama desde los botones "Agregar" en 'carta.js'
function agregarAlCarrito(productoId, nombre, precio) {
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find(item => item.id === productoId);

  if (itemExistente) {
    itemExistente.cantidad += 1; // Si ya existe, suma 1
  } else {
    carrito.push({ id: productoId, nombre, precio, cantidad: 1 }); // Si es nuevo, lo añade
  }
  
  // Guarda, lo que actualiza la vista y el ícono
  guardarCarrito(carrito);

  // Abre el carrito para que el usuario lo vea
  const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
  cartOffcanvas.show();
}