function registrarse() {
  let email = document.getElementById("emailRegister").value;
  let pass = document.getElementById("passRegister").value;

  if (email == "cliente1@sandwich.cl" && pass == "Clave2025") {
    window.location.href = "/src/html/principal/carta.html";
  }
  if (email == "cliente2@sandwish.cl") {
    alert("El correo ya está en uso");
  }
  if (email == "nuevo@sandwish.cl" && pass == "abc") {
    alert("La contraseña no cumple requisitos");
  }
}

function iniciarSesion() {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  let contador = 0;

  if (email == "cliente1@sandwich.cl" && pass == "clave2025") {
    location.href = "mispedidos.html";
  } else if (email == "cliente1@sandwich.cl" && pass != "clave2025") {
    alert("Contraseña incorrecta");
    contador++;
    if (contador >= 3) {
      alert("Cuenta Bloqueada.");
    }
  }
}

/**
 * Guarda el carrito en localStorage.
 * @param {Array} carrito - El array del carrito a guardar.
 */
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Obtiene el carrito desde localStorage.
 * @returns {Array} - El array del carrito.
 */
function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

/**
 * "Dibuja" los productos del carrito en el HTML del Offcanvas.
 */
function actualizarCarritoHTML() {
  const offcanvasBody = document.querySelector('#cartOffcanvas .offcanvas-body');
  const carrito = getCarrito(); // Obtenemos el carrito actualizado

  if (!offcanvasBody) {
    // Si no existe el offcanvas en esta página, no hacemos nada.
    return;
  }
  
  if (carrito.length === 0) {
    offcanvasBody.innerHTML = `
      <p>Tu carrito está vacío.</p>
      <a href="/src/html/confirmacion.html" class="btn btn-success w-100 disabled" aria-disabled="true">Ir a pagar</a>
    `;
    return;
  }

  let total = 0;
  offcanvasBody.innerHTML = ''; 

  carrito.forEach((producto) => {
    const cantidad = producto.cantidad || 1;
    const precio = producto.precio || 0;
    const subtotalProducto = precio * cantidad;
    total += subtotalProducto;

    offcanvasBody.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <img src="${producto.img}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div class="mx-2 flex-grow-1">
          <h6 class="mb-0" style="font-size: 0.9rem;">${producto.nombre}</h6>
          <small class="text-muted">$${precio.toLocaleString()}</small>
        </div>
        <input type="number" 
               class="form-control form-control-sm mx-2 input-cantidad" 
               value="${cantidad}" 
               min="1" 
               style="width: 60px;"
               data-id="${producto.id}">
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${producto.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <hr class="my-2">
    `;
  });

  offcanvasBody.innerHTML += `
    <div class="d-flex justify-content-between align-items-center mt-3">
      <h5 class="fw-bold">Total:</h5>
      <h5 class="fw-bold">$${total.toLocaleString()}</h5>
    </div>
    <a href="/src/html/confirmacion.html" class="btn btn-success w-100 mt-3">Ir a pagar</a>
  `;
}


function eliminarProductoDelCarrito(productoId) {
  let carrito = getCarrito();
  carrito = carrito.filter(p => p.id !== productoId);
  guardarCarrito(carrito);
  actualizarCarritoHTML(); // Actualizamos la vista
}

/**
 * Actualiza la cantidad de un producto.
 */
function actualizarCantidad(productoId, nuevaCantidad) {
  let carrito = getCarrito();
  const productoEnCarrito = carrito.find(p => p.id === productoId);
  
  if (nuevaCantidad <= 0) {
    eliminarProductoDelCarrito(productoId);
  } else if (productoEnCarrito) {
    productoEnCarrito.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
    actualizarCarritoHTML();
  }
}

// Espera a que el DOM se cargue en CUALQUIER página
document.addEventListener('DOMContentLoaded', () => {
  // 1. Dibuja el carrito en cuanto carga la página
  actualizarCarritoHTML();

  // 2. Asigna los listeners para los botones DENTRO del offcanvas
  const offcanvas = document.getElementById('cartOffcanvas');
  if (offcanvas) {
    // Listener para botones "Eliminar" (click)
    offcanvas.addEventListener('click', (e) => {
      const botonEliminar = e.target.closest('.btn-eliminar');
      if (botonEliminar) {
        e.preventDefault();
        const productoId = parseInt(botonEliminar.dataset.id);
        if (!isNaN(productoId)) {
          eliminarProductoDelCarrito(productoId);
        }
      }
    });

    // Listener para inputs de cantidad (change)
    offcanvas.addEventListener('change', (e) => {
      if (e.target.classList.contains('input-cantidad')) {
        const productoId = parseInt(e.target.dataset.id);
        let nuevaCantidad = parseInt(e.target.value);

        if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
          nuevaCantidad = 0; // Si pone "0" o "asd", se elimina
        }

        if (!isNaN(productoId)) {
          actualizarCantidad(productoId, nuevaCantidad);
        }
      }
    });
  }
});