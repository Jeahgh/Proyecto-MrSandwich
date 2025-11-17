document.addEventListener('DOMContentLoaded', () => {
    
    const profileForm = document.getElementById('profileForm');
    const btnHabilitar = document.getElementById('btnHabilitarEdicion');
    const inputNombre = document.getElementById('profileName');
    
    if (profileForm) {
        profileForm.addEventListener('submit', actualizarDatosUsuario);
    }
    
    if (btnHabilitar) {
        btnHabilitar.addEventListener('click', () => {
            inputNombre.readOnly = false;
            inputNombre.focus();
            document.getElementById('btnGuardarPerfil').style.display = 'block';
            btnHabilitar.style.display = 'none';
        });
    }
    cargarDatosUsuario();
});


async function cargarDatosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.access_token) {
        showAlert('Debes iniciar sesión para ver tu perfil.', 'error');
        window.location.href = '/src/html/principal/index.html';
        return;
    }

    try {
        // fech GET /users/me
        const response = await fetch('http://localhost:8000/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${usuario.access_token}`
            }
        });

        if (!response.ok) {
            showAlert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
            cerrarSesion(); 
            return;
        }

        // caso exitoso
        const userData = await response.json(); 
        
        // rellenar el formulario
        document.getElementById('profileEmail').value = userData.email;
        document.getElementById('profileName').value = userData.full_name;

    } catch (err) {
        console.error('Error al cargar datos:', err);
        showAlert('No se pudieron cargar los datos del perfil.', 'error');
    }
}



async function actualizarDatosUsuario(event) {
    event.preventDefault(); 

    const submitButton = document.getElementById('btnGuardarPerfil');
    const btnHabilitar = document.getElementById('btnHabilitarEdicion');
    const inputNombre = document.getElementById('profileName');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const newName = inputNombre.value;

    if (!usuario || !usuario.access_token) {
        showAlert('No estás autenticado.', 'error');
        return;
    }

    if (!newName) {
        showAlert('El nombre no puede estar vacío.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Cambios';
        return;
    }

    try {
        // 3. ¡EL FETCH (PUT)!
        const response = await fetch('http://localhost:8000/users/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${usuario.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ full_name: newName }) 
        });

        if (!response.ok) {
            throw new Error('No se pudo actualizar el perfil.');
        }

        const updatedUser = await response.json();
        

        usuario.email = updatedUser.email; 
        const userIconLink = document.querySelector('.nav-link.dropdown-toggle');
        if (userIconLink) {
            userIconLink.innerHTML = `<i class="fa-solid fa-user"></i> ${updatedUser.email}`; 
        }

        showAlert('¡Perfil actualizado con éxito!', 'ok');

        inputNombre.readOnly = true;
        submitButton.style.display = 'none';
        btnHabilitar.style.display = 'block';


    } catch (err) {
        console.error('Error al actualizar:', err);
        showAlert(err.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Cambios';
    }
}