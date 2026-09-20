document.addEventListener('DOMContentLoaded', () => {
  const btnLoginModal = document.getElementById('btn-login-modal');
  const modalLogin = document.getElementById('modal-login');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const formLogin = document.getElementById('form-login');
  const adminEmailInput = document.getElementById('admin-email');
  const adminPasswordInput = document.getElementById('admin-password');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const catalogContainer = document.getElementById('catalog-container');

  // Control del modal
  if (btnLoginModal && modalLogin) {
    btnLoginModal.addEventListener('click', (e) => {
      e.preventDefault();
      modalLogin.classList.add('active');
    });
  }

  if (btnCloseModal && modalLogin) {
    btnCloseModal.addEventListener('click', () => {
      modalLogin.classList.remove('active');
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) {
      modalLogin.classList.remove('active');
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }
  });

  // Inicio de sesión con Supabase Auth
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = adminEmailInput ? adminEmailInput.value.trim() : '';
      const password = adminPasswordInput.value.trim();

      if (!email || !password) {
        showError('Por favor completa todos los campos.');
        return;
      }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          showError('Credenciales incorrectas: ' + error.message);
        } else {
          modalLogin.classList.remove('active');
          formLogin.reset();
          if (loginErrorMsg) loginErrorMsg.style.display = 'none';
          
          // Redirigir al panel de administración
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

  // Carga del catálogo
  async function cargarProductosSupabase() {
    if (!catalogContainer) return;

    try {
      const { data: productos, error } = await supabaseClient
        .from('productos')
        .select('*');

      if (error) {
        console.error('Error al obtener datos:', error);
        catalogContainer.innerHTML = '<p>Error al cargar el catálogo.</p>';
        return;
      }

      if (productos && productos.length > 0) {
        renderizarCatalogo(productos);
      } else {
        catalogContainer.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
      }
    } catch (err) {
      console.error('Error de red o conexión:', err);
    }
  }

  function renderizarCatalogo(productos) {
    catalogContainer.innerHTML = '';
    productos.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <div class="catalog-img-box">
          <img src="${prod.imagen_url || 'img/sarten.png'}" alt="${prod.nombre}">
        </div>
        <div class="catalog-info">
          <h4>${prod.nombre}</h4>
          <p class="catalog-price">$${parseFloat(prod.precio).toFixed(2)}</p>
          <p class="catalog-desc">${prod.descripcion || ''}</p>
          <button class="catalog-btn">Comprar</button>
        </div>
      `;
      catalogContainer.appendChild(card);
    });
  }

  cargarProductosSupabase();
});