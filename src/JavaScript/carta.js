document.addEventListener('DOMContentLoaded', () => {

    // ocultar botones de admin si el usuario no es admin
    const user = JSON.parse(localStorage.getItem("usuario"));
    const isAdmin = user && user.role === 'admin';

    const btnCrearProducto = document.getElementById('btn-crear-producto');
    if (btnCrearProducto && !isAdmin) {
        btnCrearProducto.style.display = 'none';
    }

    const adminPanelModal = document.getElementById('admin-button-panel');
    if (adminPanelModal && !isAdmin) {
        adminPanelModal.style.display = 'none';
    }
    
    // trozos de codigo que usan elementos del DOM
    const secciones = document.getElementById('secciones-productos');
    const busqueda = document.getElementById('busqueda');
    const categoriaSelect = document.getElementById('categoriaSelect');
    

    // --- Elementos del modal de DETALLE ---
    const modalTitulo = document.getElementById("modalTitulo");
    const modalDescripcion = document.getElementById("modalDescripcion");
    const modalPrecio = document.getElementById("modalPrecio");
    const modalImg = document.getElementById("modalImg");
    const modalBtnAgregar = document.querySelector('#productoModal .btn-success');
    const productoModal = new bootstrap.Modal(document.getElementById("productoModal"));
    

    // botones del modal de DETALLE
    const btnModalDelete = document.getElementById("btnModalDelete");
    const btnModalEdit = document.getElementById("btnModalEdit"); 

    // Elementos del modal de CONFIRMAR ELIMINACIÓN 
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    const btnConfirmDelete = document.getElementById("btnConfirmDelete");

    // Elementos del modal de CREAR 
    const formCrearProducto = document.getElementById("formCrearProducto");
    
    // Elementos del modal de EDITAR
    const editProductoModal = new bootstrap.Modal(document.getElementById("editProductoModal"));
    const formEditarProducto = document.getElementById("formEditarProducto");

    // Variables Globales 
    let productosDelBackend = []; 
    let idParaEliminar = null; 
    let idParaEditar = null; 

    const titulos = { 
        sandwich: "Sándwiches", 
        wrap: "Wraps", 
        postre: "Postres", 
        bebida: "Bebidas" 
    };

    // crear un producto
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

        // Llamada al backend
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
            location.reload();
            document.getElementById("formCrearProducto").reset();
            
            productosDelBackend.push(nuevoProducto); 
            renderizarCarta(); 
        } catch (err) {
            console.error(err);
            showAlert("Error al conectar con backend", "error");
        }
    }

    // editar un producto
    async function editarProducto(event) {
        event.preventDefault(); 
        if (!idParaEditar) return; 

        // datos del formulario editar
        const name = document.getElementById("productNameEdit").value;
        const category = document.getElementById("productCategoryEdit").value;
        const price = parseFloat(document.getElementById("productPriceEdit").value);
        const image = document.getElementById("productImageEdit").value;
        const description = document.getElementById("productDescriptionEdit").value;

        const data = { name, description, price, image, category };

        // Llamada al backend con put
        try {
            const response = await fetch(`http://localhost:8000/products/${idParaEditar}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                showAlert(errorData.detail || "No se pudo editar el producto", "error");
                return;
            }

            showAlert("Producto actualizado con éxito!", "ok");
            
            editProductoModal.hide();
            location.reload();

        } catch (err) {
            console.error(err);
            showAlert("Error al conectar con backend", "error");
        }
    }

    // eliminar un producto
    async function eliminarProducto(id) {
        if (!id) return; 

        // Llamada al backend con delete
        try {
            const response = await fetch(`http://localhost:8000/products/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Error al eliminar el producto desde la API");
            }

            showAlert("Producto eliminado con éxito", "ok");
            confirmDeleteModal.hide();
            
            // Limpia el 'backdrop' también al eliminar, por seguridad.
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.remove();
            });
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'auto';
            
            productosDelBackend = productosDelBackend.filter(p => p._id !== id);
            renderizarCarta();
            idParaEliminar = null;
        } catch (err) {
            console.error(err);
            showAlert(err.message, "error");
        }
    }

    // funcion de carga inicial de productos
    // --- MODIFICADO: Incluye lógica de scroll ---
    async function fetchYRenderizarProductos() {

        // Llamada al backend para obtener productos
        try {
            const response = await fetch("http://localhost:8000/products/");
            if (!response.ok) {
                throw new Error("No se pudieron cargar los productos del backend.");
            }
            productosDelBackend = await response.json(); 
            
            // 1. Renderizar carta
            renderizarCarta(); 

            // 2. MODIFICACIÓN: Scroll automático si hay un #hash en la URL
            setTimeout(() => {
                const hash = window.location.hash; // ejemplo: "#sandwich"
                if (hash) {
                    // Seleccionamos por ID (ej: <h3 id="sandwich">)
                    // Quitamos el # para getElementById o usamos querySelector(hash)
                    const elemento = document.querySelector(hash);
                    if (elemento) {
                        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 100);

        } catch (err) {
            console.error(err);
            if (secciones) {
                secciones.innerHTML = `<p class="text-danger text-center fs-4">Error al cargar el menú.</p>`;
            }
        }
    }

    // funcion para filtrar productos
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

    // funcion para renderizar la carta con el filtro aplicado
    // --- MODIFICADO: Agrega ID al título ---
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
                
                // --- CAMBIO AQUÍ: Asignar ID y Scroll Margin ---
                titulo.id = cat; 
                titulo.style.scrollMarginTop = "100px"; 
                // ----------------------------------------------
                
                titulo.className = "text-warning mt-5 mb-3 fw-bold";
                titulo.textContent = titulos[cat] || cat; 
                secciones.appendChild(titulo);
                
                const fila = document.createElement("div");
                fila.className = "row g-4";
                productosDeEstaCategoria.forEach(p => {
                    const col = document.createElement("div");
                    col.className = "col-md-3";
                    const imgUrl = p.image || "https://via.placeholder.com/300x200.png?text=Mr.Sandwich";
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
    
    // LISTENERS PRINCIPALES 
    if (busqueda) {
        busqueda.addEventListener("input", () => renderizarCarta());
    }
    if (categoriaSelect) {
        categoriaSelect.addEventListener("change", () => renderizarCarta());
    }
    if (formCrearProducto) { 
        formCrearProducto.addEventListener("submit", crearProducto);
    }
    if (formEditarProducto) {
        formEditarProducto.addEventListener("submit", editarProducto);
    }

    // listener para el ojo y agregar
    if (secciones) {
        secciones.addEventListener('click', (e) => {
            const botonAgregar = e.target.closest('.btn-agregar-carta');
            const botonDetalle = e.target.closest('.btn-ver-detalle');

            if (botonAgregar) {
                e.preventDefault(); 
                const productoId = botonAgregar.dataset.id;
                
                // Buscamos el producto en nuestra lista local para obtener los datos
                const producto = productosDelBackend.find(p => p._id === productoId);
                if (producto) {
                    // Llamamos a la función de modelo.js (asegúrate de tener modelo.js cargado)
                    if (typeof agregarAlCarrito === "function") {
                        agregarAlCarrito(producto._id, producto.name, producto.price);
                    } else {
                        console.error("Función agregarAlCarrito no encontrada en modelo.js");
                    }
                }
            }

            if (botonDetalle) {
                e.preventDefault(); 
                const productoId = botonDetalle.dataset.id; 
                const producto = productosDelBackend.find(p => p._id === productoId); 
                if (producto) {
                    modalTitulo.textContent = producto.name;
                    modalDescripcion.textContent = producto.description || "Sin descripción.";
                    modalPrecio.textContent = `$${producto.price.toLocaleString('es-CL')}`;
                    modalImg.src = producto.image || "https://via.placeholder.com/600x200.png?text=Mr.Sandwich";
                    modalBtnAgregar.dataset.id = producto._id;
                    btnModalDelete.dataset.id = producto._id;
                    btnModalEdit.dataset.id = producto._id; 
                    productoModal.show();
                }
            }
        });
    }

    // listener para el boton agregar, editar y eliminar en el modal
    if (modalBtnAgregar) {
        modalBtnAgregar.addEventListener('click', (e) => {
            const productoId = e.target.dataset.id;
            if (productoId) {
                const producto = productosDelBackend.find(p => p._id === productoId);
                if (producto) {
                     if (typeof agregarAlCarrito === "function") {
                        agregarAlCarrito(producto._id, producto.name, producto.price);
                    }
                }
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
            
            const producto = productosDelBackend.find(p => p._id === productoId);
            if (!producto) return;

            document.getElementById("productNameEdit").value = producto.name;
            document.getElementById("productCategoryEdit").value = producto.category;
            document.getElementById("productPriceEdit").value = producto.price;
            document.getElementById("productImageEdit").value = producto.image || "";
            document.getElementById("productDescriptionEdit").value = producto.description || "";

            idParaEditar = productoId;
            
            productoModal.hide();
            editProductoModal.show();
        });
    }

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            eliminarProducto(idParaEliminar);
        });
    }

    fetchYRenderizarProductos();

});