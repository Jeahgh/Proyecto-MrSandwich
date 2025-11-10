// Este script controla recuperarpsw.html y recuperarpsw2.html


//  confirmar mail y solicitar token de reseteo
async function solicitarReseteo(event) {
    event.preventDefault();
    const email = document.getElementById("emailRecover").value;
    if (!email) {
        return showAlert("Por favor, ingresa tu correo electrónico.", "error");
    }

    // enviar la solicitud al backend
    try {
        const response = await fetch("http://localhost:8000/users/request-password-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        // verificar  la respuesta con el backend
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Error al solicitar reseteo");
        }

        const data = await response.json(); 

        // Guardamos el token en sessionStorage para usarlo en la página 2
        sessionStorage.setItem("reset_token", data.access_token);
        
        showAlert("Email verificado. Serás redirigido...", "ok");
        
        // Redirigimos al usuario a la página 2
        setTimeout(() => {
            location.href = "/src/html/recuperarpsw2.html";
        }, 2000);

    } catch (err) {
        console.error(err);
        showAlert(err.message, "error");
    }
}


// cambiar la contraseña usando el token
async function confirmarReseteo(event) {
    event.preventDefault();
    
    const token = sessionStorage.getItem("reset_token");
    const new_password = document.getElementById("newPassword").value;

    if (!token) {
        showAlert("No tienes un token de reseteo. Por favor, solicita uno de nuevo.", "error");
        location.href = "/src/html/recuperarpsw.html";
        return;
    }

    if (new_password.length < 6) {
        showAlert("La contraseña debe tener al menos 6 caracteres.", "error");
        return;
    }

    // enviar la solicitud al backend fetch
    try {
        const response = await fetch("http://localhost:8000/users/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token, new_password: new_password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Error al resetear la contraseña");
        }

        // Limpiamos el token del sessionStorage
        sessionStorage.removeItem("reset_token"); 
        showAlert("¡Contraseña actualizada exitosamente!", "ok");

        // Redirigimos al usuario a la página principal
        setTimeout(() => {
            location.href = "/src/html/principal/index.html"; 
        }, 2000);

    } catch (err) {
        console.error(err);
        showAlert(err.message, "error");
    }
}