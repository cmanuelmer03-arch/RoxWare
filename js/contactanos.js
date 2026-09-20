/* ==========================================
   CONTACTO - ROXWARE
   Lógica del modal de inicio de sesión
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  const btnLoginModal      = document.getElementById('btn-login-modal');
  const modalLogin         = document.getElementById('modal-login');
  const btnCloseModal      = document.getElementById('btn-close-modal');
  const formLogin          = document.getElementById('form-login');
  const adminEmailInput    = document.getElementById('admin-email');
  const adminPasswordInput = document.getElementById('admin-password');
  const loginErrorMsg      = document.getElementById('login-error-msg');

  // Abrir modal
  if (btnLoginModal && modalLogin) {
    btnLoginModal.addEventListener('click', (e) => {
      e.preventDefault();
      modalLogin.classList.add('active');
    });
  }

  // Cerrar con la X
  if (btnCloseModal && modalLogin) {
    btnCloseModal.addEventListener('click', () => {
      modalLogin.classList.remove('active');
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    });
  }

  // Cerrar al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) {
      modalLogin.classList.remove('active');
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }
  });

  // Enviar formulario de login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = adminEmailInput ? adminEmailInput.value.trim() : '';
      const password = adminPasswordInput ? adminPasswordInput.value.trim() : '';

      if (!email || !password) {
        showError('Por favor completa todos los campos.');
        return;
      }

      try {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          showError('Credenciales incorrectas: ' + error.message);
        } else {
          modalLogin.classList.remove('active');
          formLogin.reset();
          if (loginErrorMsg) loginErrorMsg.style.display = 'none';
          window.location.href = 'admin.html';
        }
      } catch (err) {
        console.error('Error durante el inicio de sesión:', err);
        showError('Ocurrió un error de red.');
      }
    });
  }

  function showError(msg) {
    if (loginErrorMsg) {
      loginErrorMsg.textContent = msg;
      loginErrorMsg.style.display = 'block';
    }
  }
});