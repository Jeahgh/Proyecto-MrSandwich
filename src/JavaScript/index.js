document.addEventListener('DOMContentLoaded', () => {
  console.log('index.js cargado correctamente.');
});

const userLog = JSON.parse(localStorage.getItem("usuario"));
if (userLog) {
  // ocultar opción iniciar sesión
  const loginOption = document.querySelector('a[data-bs-target="#loginModal"]');
  if (loginOption) loginOption.closest('li').style.display = 'none';

  // mostrar nombre arriba
  const userIcon = document.querySelector('.fa-user').parentElement;
  userIcon.innerHTML = `<i class="fa-solid fa-user"></i> ${userLog.email}`;

}

