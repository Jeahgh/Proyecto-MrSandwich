document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos principales de la página ---
  const secciones = document.getElementById('secciones-productos');
  const busqueda = document.getElementById('busqueda');
  const categoriaSelect = document.getElementById('categoriaSelect');
  
  // --- Elementos del modal de DETALLE de producto ---
  const modalTitulo = document.getElementById("modalTitulo");
  const modalDescripcion = document.getElementById("modalDescripcion");
  const modalPrecio = document.getElementById("modalPrecio");
  const modalImg = document.getElementById("modalImg");
  const modalBtnAgregar = document.querySelector('#productoModal .btn-success');
  const productoModal = new bootstrap.Modal(document.getElementById("productoModal"));
  
  // --- Botones de Admin en el modal de DETALLE ---
  const btnModalDelete = document.getElementById("btnModalDelete");
  const btnModalEdit = document.getElementById("btnModalEdit"); 

  // --- Elementos del modal de CONFIRMAR ELIMINACIÓN ---
  const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");

  // --- Elementos del modal de CREAR producto ---
  const formCrearProducto = document.getElementById("formCrearProducto");
  if (formCrearProducto) {
    formCrearProducto.addEventListener("submit", crearProducto); 
  }
  
  // --- Variables Globales ---
  let productosDelBackend = []; 
  let idParaEliminar = null; 

  const titulos = { 
    sandwich: "Sándwiches", 
    wrap: "Wraps", 
    postre: "Postres", 
    bebida: "Bebidas" 
  };

  // ==========================================================
  // FUNCIÓN PARA CREAR UN PRODUCTO
  // ==========================================================
  async function crearProducto(event) {
    event.preventDefault(); 
    
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const image = document.getElementById("productImage").value;
    const description = document.getElementById("productDescription").value;

    if (!name || !category || !price) {
      showAlert("Nombre, Categoría y Precio son obligatorios", "error");
      return;
    }
    const data = { name, description, price, image, category };

    try {
      const response = await fetch("http://localhost:8000/products/", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        showAlert(errorData.detail || "No se pudo crear el producto", "error");
        return;
      }

      const nuevoProducto = await response.json(); 
      showAlert("Producto creado con éxito!", "ok");
      
      const modal = bootstrap.Modal.getInstance(document.getElementById("agregarProductoModal"));
      modal.hide();
      document.getElementById("formCrearProducto").reset();
      
      productosDelBackend.push(nuevoProducto); // Actualiza lista
      renderizarCarta(); // Re-dibuja el DOM
    } catch (err) {
      console.error(err);
      showAlert("Error al conectar con backend", "error");
    }
  }

  // ==========================================================
  // FUNCIÓN PARA ELIMINAR UN PRODUCTO
  // ==========================================================
  async function eliminarProducto(id) {
    if (!id) return; 

    try {
      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto desde la API");
      }

      showAlert("Producto eliminado con éxito", "ok");
      
      confirmDeleteModal.hide();
      
      // Actualiza la lista local
      productosDelBackend = productosDelBackend.filter(p => p._id !== id);
      
      // Re-dibuja la carta
      renderizarCarta();

      idParaEliminar = null;

    } catch (err) {
      console.error(err);
      showAlert(err.message, "error");
    }
  }

  // ==========================================================
  // FUNCIÓN PARA OBTENER Y RENDERIZAR PRODUCTOS
  // ==========================================================
  
  async function fetchYRenderizarProductos() {
    try {
      const response = await fetch("http://localhost:8000/products/");
      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos del backend.");
      }
      productosDelBackend = await response.json(); 
      renderizarCarta(); 
    } catch (err) {
      console.error(err);
      if (secciones) {
          secciones.innerHTML = `<p class="text-danger text-center fs-4">Error al cargar el menú.</p>`;
      }
    }
  }

  function filtrarProductos(filtro = "", categoria = "all") {
    const filtroLower = filtro.toLowerCase();
    const filtrados = productosDelBackend.filter(p => {
      const coincideTexto = p.name.toLowerCase().includes(filtroLower) || 
                            (p.description && p.description.toLowerCase().includes(filtroLower));
      const coincideCategoria = categoria === "all" || p.category === categoria;
      return coincideTexto && coincideCategoria;
    });
    const categoryOrder = ["sandwich", "wrap", "postre", "bebida"];
    filtrados.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b));
    return filtrados;
  }

  /**
   * Dibuja las tarjetas de producto en el HTML.
   */
  function renderizarCarta(filtro = busqueda.value, categoria = categoriaSelect.value) {
    if (!secciones) {
        console.error("¡Error! No se encontró el div #secciones-productos en tu HTML.");
        return;
    }

    const productosFiltrados = filtrarProductos(filtro, categoria);
    secciones.innerHTML = ""; 

    if (productosFiltrados.length === 0) {
      secciones.innerHTML = `<p class="text-center text-secondary fs-5">No se encontraron productos.</p>`;
      return;
    }

    const categoriasPresentes = [...new Set(productosFiltrados.map(p => p.category))];
    const categoryOrder = ["sandwich", "wrap", "postre", "bebida"];
    categoriasPresentes.sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    categoriasPresentes.forEach(cat => {
      const productosDeEstaCategoria = productosFiltrados.filter(p => p.category === cat);
      if (productosDeEstaCategoria.length > 0) {
        const titulo = document.createElement("h3");
        titulo.className = "text-warning mt-5 mb-3 fw-bold";
        titulo.textContent = titulos[cat] || cat; 
        secciones.appendChild(titulo);
        const fila = document.createElement("div");
        fila.className = "row g-4";
        
        productosDeEstaCategoria.forEach(p => {
          const col = document.createElement("div");
          col.className = "col-md-3";
          const imgUrl = p.image || "https://via.placeholder.com/300x200.png?text=Mr.Sandwich";

          // HTML de la tarjeta (SIN botón de eliminar)
          col.innerHTML = `
            <div class="card h-100 shadow-sm">
              <img src="${imgUrl}" class="card-img-top" style="object-fit:cover; height:180px;">
              <div class="card-body text-center d-flex flex-column">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text text-warning fw-bold">$${p.price.toLocaleString('es-CL')}</p>
                <div class="mt-auto">
                  <a href="#" class="btn btn-warning btn-agregar-carta" data-id="${p._id}">Agregar</a>
                  <a href="#" class="btn btn-outline-secondary btn-ver-detalle" data-id="${p._id}">
                    <i class="fa-solid fa-eye"></i>
                  </a>
                </div>
              </div>
            </div>`;
          fila.appendChild(col);
        });
        secciones.appendChild(fila);
      }
    });
  }
  
  // ==========================================================
  // LISTENERS (Escuchadores de eventos)
  // ==========================================================

  if (busqueda) {
    busqueda.addEventListener("input", () => renderizarCarta());
  }
  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", () => renderizarCarta());
  }

  // Listener para los botones en las TARJETAS (Agregar y Ojo)
  if (secciones) {
    secciones.addEventListener('click', (e) => {
      const botonAgregar = e.target.closest('.btn-agregar-carta');
      const botonDetalle = e.target.closest('.btn-ver-detalle');

      if (botonAgregar) {
        e.preventDefault(); 
        const productoId = botonAgregar.dataset.id;
        console.log("Agregar al carrito (ID):", productoId);
        showAlert("Producto agregado (función pendiente)", "ok");
      }

      // ESTA ES LA LÓGICA QUE ABRE EL OJO
      if (botonDetalle) {
        e.preventDefault(); 
        const productoId = botonDetalle.dataset.id; // <-- AHORA ESTO TENDRÁ EL ID
        const producto = productosDelBackend.find(p => p._id === productoId); 
        
        if (producto) {
          modalTitulo.textContent = producto.name;
          modalDescripcion.textContent = producto.description || "Sin descripción.";
          modalPrecio.textContent = `$${producto.price.toLocaleString('es-CL')}`;
          modalImg.src = producto.image || "https://via.placeholder.com/600x400.png?text=Mr.Sandwich";
          
          modalBtnAgregar.dataset.id = producto._id;
          btnModalDelete.dataset.id = producto._id;
          btnModalEdit.dataset.id = producto._id;
          
          productoModal.show(); // <-- La línea mágica
        }
      }
    });
  }

  // --- Listeners para los botones DENTRO del modal de detalle ---

  if (modalBtnAgregar) {
    modalBtnAgregar.addEventListener('click', (e) => {
      const productoId = e.target.dataset.id;
      if (productoId) {
        console.log("Agregar al carrito (desde modal):", productoId);
        showAlert("Producto agregado (función pendiente)", "ok");
        productoModal.hide();
      }
    });
  }

  if (btnModalDelete) {
    btnModalDelete.addEventListener('click', (e) => {
      idParaEliminar = e.target.dataset.id; 
      productoModal.hide();
      confirmDeleteModal.show();
    });
  }

  if (btnModalEdit) {
    btnModalEdit.addEventListener('click', (e) => {
      const productoId = e.target.dataset.id;
      console.log("ID para Editar:", productoId);
      showAlert("Función de Editar pendiente", "ok");
    });
  }

  // --- Listener para el botón FINAL de confirmación ---
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      eliminarProducto(idParaEliminar);
    });
  }

  // --- INICIO DE LA CARGA DE LA PÁGINA ---
  fetchYRenderizarProductos();

}); // Fin del DOMContentLoaded