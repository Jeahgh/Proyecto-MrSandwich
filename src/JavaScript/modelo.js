//  ALERTAS PROPIAS 
function showAlert(msg, type = "ok") {
  const box = document.getElementById("app-alert");
  box.textContent = msg;
  box.className = type;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}



// REGISTRO USUARIO 
async function registrarse(event) {
  event.preventDefault();

  let name = document.getElementById("nameRegister").value;
  let email = document.getElementById("emailRegister").value;
  let pass = document.getElementById("passRegister").value;

  if (pass.length < 6) {
    showAlert("La contraseña debe tener mínimo 6 caracteres","error");
    return;
  }

  // PREPARAR DATA
  const data = { full_name: name, email, password: pass };

  // ENVÍO AL BACKEND /(fetch)
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



// INICIAR SESIÓN
async function iniciarSesion(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  const data = { email, password: pass };

  // ENVÍO AL BACKEND /(fetch)
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

    // RESPUESTA EXITOSA
    const result = await response.json(); 

    // ALMACENAR EN LOCALSTORAGE la info del usuario
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



//CERRAR SESIÓN
function cerrarSesion() {
  localStorage.removeItem("usuario");
  showAlert("Sesión cerrada","ok");
  location.reload();
}



