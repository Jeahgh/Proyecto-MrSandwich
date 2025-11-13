document.addEventListener('DOMContentLoaded', () => {
    const userLog = JSON.parse(localStorage.getItem("usuario"));
    // 2. Busca todos los elementos del menú en la página
    const itemsAutenticados = document.querySelectorAll('.menu-item-autenticado');
    const itemsNoAutenticados = document.querySelectorAll('.menu-item-no-autenticado');
    const itemsAdmin = document.querySelectorAll('.menu-item-admin'); 
    const userIconLink = document.querySelector('.nav-link.dropdown-toggle');

    // 3. Lógica para mostrar/ocultar elementos del menú
    if (userLog) {
        // --- CASO: EL USUARIO ESTÁ LOGUEADO ---
        if (userIconLink) {
            userIconLink.innerHTML = `<i class="fa-solid fa-user"></i> ${userLog.email}`;
        }
        itemsAutenticados.forEach(item => {
            item.style.display = 'block';
        });
        itemsNoAutenticados.forEach(item => {
            item.style.display = 'none';
        });


        if (userLog.role === 'admin') {
            itemsAdmin.forEach(item => {
                item.style.display = 'block';
            });
        } else {
            itemsAdmin.forEach(item => {
                item.style.display = 'none';
            });
        }

    } else {
        // --- CASO: EL USUARIO NO ESTÁ LOGUEADO ---

        if (userIconLink) {
            userIconLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
        }

        itemsAutenticados.forEach(item => {
            item.style.display = 'none';
        });

        itemsAdmin.forEach(item => {
            item.style.display = 'none';
        });

        itemsNoAutenticados.forEach(item => {
            item.style.display = 'block';
        });
    }

    actualizarVistaCarrito();
    actualizarIconoCarrito();
});