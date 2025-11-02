document.addEventListener('DOMContentLoaded', () => {
  const secciones = document.getElementById('secciones-productos');
  const busqueda = document.getElementById('busqueda');
  const categoriaSelect = document.getElementById('categoriaSelect');
  
  if (!secciones) {
    return;
  }


  const productosData = [
    // Sandwiches
    { id: 1, nombre: "Lomo Kassler Tomates Horneados", categoria: "sandwich", precio: 5990, img: "/src/img/carta/lomo.jpg", descripcion: "El lomo kassler tiene ese toque ahumado que enamora, y cuando lo juntas con tomates que horneamos hasta que se caramelicen un poco… bueno, ya es otro nivel. Le ponemos rúcula fresca para ese contraste y nuestra mayonesa casera que redondea todo." },
    { id: 2, nombre: "Pastrami Clásico", categoria: "sandwich", precio: 6990, img: "/src/img/carta/pastrami.jpg", descripcion: "Este es amor puro: pastrami de vacuno en su punto, con ese aderezo especial que preparamos (y no, no vamos a revelar el secreto). Gouda ahumado que se derrite suavecito y un coleslaw crujiente que le da frescura. Simple, pero adictivo." },
    { id: 3, nombre: "Mortadella con Pistachos", categoria: "sandwich", precio: 6490, img: "/src/img/carta/mortadella.jpg", descripcion: "¿Probaste alguna vez mortadella artesanal estilo italiano? La nuestra tiene pistachos de verdad — se ven, se sienten. Mozzarella cremosa, rúcula y un toque de pesto. Es como un viaje directo a una trattoria." },
    { id: 4, nombre: "Porchetta de Cerdo", categoria: "sandwich", precio: 6390, img: "/src/img/carta/porchetta.jpg", descripcion: "La porchetta viene jugosa y llena de sabor. Le sumamos crema de alcachofas, un toque de gorgonzola y rúcula. Es ese sandwich que ordenas cuando quieres algo distinto pero familiar a la vez." },
    // Wraps
    { id: 5, nombre: "Wrap de Pollo", categoria: "wrap", precio: 5990, img: "/src/img/carta/Chicken_wrap.jpg", descripcion: "Tiernas tiras de pollo grillado, lechuga fresca, tomate y un toque de mayonesa, todo envuelto en una suave tortilla. Un clásico que nunca falla." },
    { id: 6, nombre: "Wrap de pescado", categoria: "wrap", precio: 5490, img: "/src/img/carta/fish_wrap.jpg", descripcion: "Trozos de pescado fresco y crujiente, mix de hojas verdes, un toque de limón y una suave salsa tártara. ¡Ligero, sabroso y diferente!" },
    { id: 7, nombre: "Wrap Mixto", categoria: "wrap", precio: 6390, img: "/src/img/carta/Mixto_wrap.jpg", descripcion: "El balance perfecto. Jamón, queso, lechuga crujiente, tomate, zanahoria rallada y un toque de cebolla. ¡Completo y fresco!" },
    { id: 8, nombre: "Wrap Vegano", categoria: "wrap", precio: 6190, img: "/src/img/carta/vegano_wrap.jpg", descripcion: "Sabor 100% vegetal. Una deliciosa base de hummus, palta (aguacate), pimentones asados y un mix de hojas verdes. Potente y delicioso." },
    // Postres
    { id: 9, nombre: "Brownie", categoria: "postre", precio: 2990, img: "/src/img/carta/Brownie.jpg", descripcion: "Brownie casero con chocolate intenso." },
    { id: 10, nombre: "Sniker de maní", categoria: "postre", precio: 3500, img: "/src/img/carta/Sniker_mani.jpg", descripcion: "Una explosión de sabor. Barra de chocolate rellena con maní tostado, caramelo y nougat. Tu dosis de energía perfecta." },
    { id: 11, nombre: "Sniker de almedras", categoria: "postre", precio: 3700, img: "/src/img/carta/Sniker_almedras.jpg", descripcion: "El toque premium. La clásica barra de chocolate y caramelo, ahora con el crujido elegante de almendras tostadas." },
    { id: 12, nombre: "Chocotorta", categoria: "postre", precio: 3990, img: "/src/img/carta/chocotorta.jpg", descripcion: "La clásica torta argentina. Irresistibles capas de galletas de chocolate, dulce de leche y una suave crema. Simplemente infaltable." },
    // Bebidas
    { id: 13, nombre: "Coca-Cola 350ml", categoria: "bebida", precio: 2300, img: "/src/img/carta/coac.jpg", descripcion: "Bebida gaseosa clásica." },
    { id: 14, nombre: "Sprite Zero 350ml", categoria: "bebida", precio: 2700, img: "/src/img/carta/sprite.jpg", descripcion: "Bebida gaseosa clásica." },
    { id: 15, nombre: "Druid", categoria: "bebida", precio: 2500, img: "/src/img/carta/druid.jpg", descripcion: "Tè helado de limón." },
    { id: 16, nombre: "Agua Mineral", categoria: "bebida", precio: 2000, img: "/src/img/carta/agua.jpg", descripcion: "Agua mineral con o sin gas." },
  ];

  const titulos = { sandwich: "Sándwiches", wrap: "Wraps", postre: "Postres", bebida: "Bebidas" };
  let categoriaSeleccionada = 'all';
  let paginaActual = 1;
  const productosPorPagina = 12;

  // --- PAGINACIÓN (Elementos creados) ---
  const paginacionDiv = document.createElement('div');
  paginacionDiv.className = 'd-flex justify-content-center align-items-center mt-4 gap-3';
  secciones.after(paginacionDiv);
  const btnAnterior = document.createElement('button');
  const btnSiguiente = document.createElement('button');
  const paginaLabel = document.createElement('span');
  btnAnterior.textContent = 'Anterior';
  btnSiguiente.textContent = 'Siguiente';
  btnAnterior.className = 'btn btn-outline-warning';
  btnSiguiente.className = 'btn btn-outline-warning';
  paginaLabel.className = 'fw-bold';
  paginacionDiv.append(btnAnterior, paginaLabel, btnSiguiente);








    // --- FUNCIONES DE CARRITO ) ---
  /**
   * Agrega un producto o incrementa su cantidad.
   * Llama a las funciones de modelo.js
   */
  function agregarProductoAlCarrito(productoId) {
    let carrito = getCarrito(); // Llama a la función de modelo.js
    const productoEnCarrito = carrito.find(p => p.id === productoId);

    if (productoEnCarrito) {
      productoEnCarrito.cantidad++;
    } else {
      const producto = productosData.find(p => p.id === productoId);
      if (producto) {
        carrito.push({ ...producto, cantidad: 1 });
      }
    }
    
    guardarCarrito(carrito); // Llama a la función de modelo.js
    actualizarCarritoHTML(); // Llama a la función de modelo.js
    new bootstrap.Offcanvas(document.getElementById('cartOffcanvas')).show();
  }

  /**
   * Lógica de filtros
   */
  function filtrarProductos(filtro = "", categoria = "all") {
    const filtrados = productosData.filter(p =>
      (categoria === "all" || p.categoria === categoria) &&
      (p.nombre.toLowerCase().includes(filtro) || p.descripcion.toLowerCase().includes(filtro))
    );
    const categoryOrder = ["sandwich", "wrap", "postre", "bebida"];
    filtrados.sort((a, b) => categoryOrder.indexOf(a.categoria) - categoryOrder.indexOf(b.categoria));
    return filtrados;
  }

  /**
   * Lógica de renderizado de la carta
   */
  function renderizarCarta(filtro = "", categoria = "all") {
    const filtrados = filtrarProductos(filtro, categoria);
    const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = filtrados.slice(inicio, fin);

    secciones.innerHTML = ""; //    Limpiar secciones

    ["sandwich", "wrap", "postre", "bebida"].forEach(cat => {
      const productosCat = productosPagina.filter(p => p.categoria === cat);
      if (productosCat.length > 0) {
        const titulo = document.createElement("h3");
        titulo.className = "text-warning mt-5 mb-3 fw-bold";
        titulo.textContent = titulos[cat];
        secciones.appendChild(titulo);
        const fila = document.createElement("div");
        fila.className = "row g-4";
        productosCat.forEach(p => {
          const col = document.createElement("div");
          col.className = "col-md-3";
          col.innerHTML = `
            <div class="card h-100 shadow-sm">
              <img src="${p.img}" class="card-img-top" style="object-fit:cover; height:180px;">
              <div class="card-body text-center d-flex flex-column">
                <h5 class="card-title">${p.nombre}</h5>
                <p class="card-text">$${p.precio.toLocaleString()}</p>
                <div class="mt-auto">
                  <a href="#" class="btn btn-warning btn-agregar-carta" data-id="${p.id}">Agregar</a>
                  <a href="#" class="btn btn-outline-secondary btn-ver-detalle" data-id="${p.id}">
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

    paginaLabel.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas || totalPaginas === 0;
  }
  
  // --- LISTENERS ESPECÍFICOS DE CARTA.HTML ---

  // Filtro de búsqueda
  busqueda.addEventListener("input", e => {
    paginaActual = 1;
    renderizarCarta(e.target.value.toLowerCase(), categoriaSeleccionada);
  });

  // Filtro de categoría
  categoriaSelect.addEventListener("change", e => {
    categoriaSeleccionada = e.target.value;
    paginaActual = 1;
    renderizarCarta(busqueda.value.toLowerCase(), categoriaSeleccionada);
  });

  // Paginación
  btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarCarta(busqueda.value.toLowerCase(), categoriaSeleccionada);
    }
  });

  btnSiguiente.addEventListener("click", () => {
    const filtrados = filtrarProductos(busqueda.value.toLowerCase(), categoriaSeleccionada);
    const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarCarta(busqueda.value.toLowerCase(), categoriaSeleccionada);
    }
  });

  // Botones "Agregar" y "Ver detalle" en las tarjetas
  secciones.addEventListener('click', (e) => {
    e.preventDefault(); 
    const botonAgregar = e.target.closest('.btn-agregar-carta');
    const botonDetalle = e.target.closest('.btn-ver-detalle');

    if (botonAgregar) {
      const productoId = parseInt(botonAgregar.dataset.id);
      agregarProductoAlCarrito(productoId);
    }

    if (botonDetalle) {
      const productoId = parseInt(botonDetalle.dataset.id);
      const producto = productosData.find(p => p.id === productoId);
      
      if (producto) {
        document.getElementById("modalTitulo").textContent = producto.nombre;
        document.getElementById("modalDescripcion").textContent = producto.descripcion;
        document.getElementById("modalPrecio").textContent = `$${producto.precio.toLocaleString()}`;
        document.getElementById("modalImg").src = producto.img;
        document.querySelector('#productoModal .btn-success').dataset.id = producto.id;
        new bootstrap.Modal(document.getElementById("productoModal")).show();
      }
    }
  });

  // Botón "Agregar" DENTRO del modal
  document.querySelector('#productoModal .btn-success').addEventListener('click', (e) => {
    const productoId = parseInt(e.target.dataset.id);
    if (productoId) {
      agregarProductoAlCarrito(productoId);
      bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();
    }
  });

  renderizarCarta();

}); // Fin del DOMContentLoaded