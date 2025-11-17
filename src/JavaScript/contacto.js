document.addEventListener('DOMContentLoaded', () => {
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', enviarMensaje);
    }
});

async function enviarMensaje(event) {
    event.preventDefault(); 
    const submitButton = document.getElementById('btnEnviarMensaje');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const type = document.getElementById('contactType').value;
        const message = document.getElementById('contactMessage').value;

        if (!name || !email || !type || !message) {
            throw new Error('Por favor, completa todos los campos.');
        }

        const data = { name, email, message, type };

        // fech API para enviar el mensaje al backend
        const response = await fetch('http://localhost:8000/messages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        //  MANEJO DE ERRORES
        if (!response.ok) {
            let errorMsg = 'No se pudo enviar el mensaje.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorMsg;
            } catch (e) {
                errorMsg = `Error: ${response.statusText}`; 
            }
            throw new Error(errorMsg);
        }

        // exito
        const result = await response.json();
        showAlert(result.message, 'ok'); 
        document.getElementById('contactForm').reset(); 

    } catch (err) {
        console.error(err);
        showAlert(err.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Mensaje';
    }
}