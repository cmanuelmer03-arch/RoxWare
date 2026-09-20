/* ==========================================
   CATÁLOGO - ROXWARE
   Lógica de la página de catálogo:
   - Modal de login (admin)
   - Carga de productos desde Supabase
   - Filtro por categoría
   - Buscador en vivo
   - Contador de resultados y estado vacío
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Referencias del DOM ---------- */
  const btnLoginModal   = document.getElementById('btn-login-modal');
  const modalLogin      = document.getElementById('modal-login');
  const btnCloseModal   = document.getElementById('btn-close-modal');
  const formLogin       = document.getElementById('form-login');
  const adminEmailInput = document.getElementById('admin-email');
  const adminPasswordInput = document.getElementById('admin-password');
  const loginErrorMsg   = document.getElementById('login-error-msg');

  const catalogContainer = document.getElementById('catalog-container');
  const catalogEmpty     = document.getElementById('catalog-empty');
  const resultsCount     = document.getElementById('results-count');
  const searchInput      = document.getElementById('search-input');
  const filterPills      = document.getElementById('filter-pills');

  /* ---------- Estado local ---------- */
  let productosCache = [];        // Todos los productos traídos de Supabase
  let categoriaActiva = 'all';    // Filtro actual
  let textoBusqueda = '';         // Texto del buscador

  /* ==========================================
     MODAL DE LOGIN (idéntico a app.js)
     ========================================== */
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
          email: email,
          password: password,
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

  /* ==========================================
     CARGA DE PRODUCTOS DESDE SUPABASE
     ========================================== */
  async function cargarProductos() {
    if (!catalogContainer) return;

    try {
      const { data: productos, error } = await supabaseClient
        .from('productos')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error al obtener datos:', error);
        catalogContainer.innerHTML = '<p>Error al cargar el catálogo.</p>';
        if (resultsCount) resultsCount.textContent = 'Error al cargar productos.';
        return;
      }

      productosCache = productos || [];
      aplicarFiltros();
    } catch (err) {
      console.error('Error de red o conexión:', err);
      catalogContainer.innerHTML = '<p>No se pudo conectar con el catálogo.</p>';
    }
  }

  /* ==========================================
     DETECCIÓN DE CATEGORÍA
     Como la tabla no tiene un campo "categoria",
     se infiere por palabras clave en nombre/descripción.
     ========================================== */
  function detectarCategoria(prod) {
    return prod.categoria || 'otros';
  }
  /* ==========================================
     FILTRADO + BÚSQUEDA
     ========================================== */
  function aplicarFiltros() {
    const texto = textoBusqueda.trim().toLowerCase();

    const filtrados = productosCache.filter((prod) => {
      const categoria = detectarCategoria(prod);
      const coincideCategoria =
        categoriaActiva === 'all' || categoria === categoriaActiva;

      const coincideTexto =
        texto === '' ||
        (prod.nombre || '').toLowerCase().includes(texto) ||
        (prod.descripcion || '').toLowerCase().includes(texto);

      return coincideCategoria && coincideTexto;
    });

    renderizarCatalogo(filtrados);
    actualizarContador(filtrados.length, productosCache.length);
    toggleEstadoVacio(filtrados.length === 0);
  }

  function actualizarContador(mostrados, total) {
    if (!resultsCount) return;

    if (total === 0) {
      resultsCount.textContent = 'Sin productos en el catálogo';
      return;
    }
    if (mostrados === total) {
      resultsCount.textContent = `Mostrando ${total} productos`;
    } else {
      resultsCount.textContent = `Mostrando ${mostrados} de ${total} productos`;
    }
  }

  function toggleEstadoVacio(vacio) {
    if (!catalogEmpty) return;
    if (vacio) {
      catalogEmpty.hidden = false;
      if (catalogContainer) catalogContainer.style.display = 'none';
    } else {
      catalogEmpty.hidden = true;
      if (catalogContainer) catalogContainer.style.display = '';
    }
  }

  /* ==========================================
     RENDER DE TARJETAS (con WhatsApp)
     ========================================== */
  function renderizarCatalogo(productos) {
    if (!catalogContainer) return;
    catalogContainer.innerHTML = '';

    // 👇 Número de WhatsApp de RoxWare
    const WHATSAPP_NUMBER = '50378694851';

    // Etiquetas legibles por categoría
    const etiquetasCategoria = {
      filtros:  'Sistema de filtros',
      sartenes: 'Sartenes y cocina',
      botellas: 'Botellas térmicas',
      otros:    'Otros'
    };

    productos.forEach((prod) => {
      const nombre      = prod.nombre || 'Producto';
      const precio      = parseFloat(prod.precio || 0).toFixed(2);
      const descripcion = prod.descripcion || '';
      const categoria   = prod.categoria || 'otros';
      const categoriaLabel = etiquetasCategoria[categoria] || 'Otros';

      // Mensaje prellenado para WhatsApp
      const mensaje = encodeURIComponent(
        `¡Hola RoxWare! 👋\n\n` +
        `Estoy interesado en este producto:\n\n` +
        `📦 *Producto:* ${nombre}\n` +
        `💰 *Precio:* $${precio}\n` +
        `📂 *Categoría:* ${categoriaLabel}\n` +
        `📝 *Descripción:* ${descripcion}\n\n` +
        `¿Me pueden dar más información para realizar mi compra?`
      );

      const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`;

      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <div class="catalog-img-box">
          <img src="${prod.imagen_url || 'img/sarten.png'}" alt="${nombre}">
        </div>
        <div class="catalog-info">
          <span class="catalog-category">${categoriaLabel}</span>
          <h4>${nombre}</h4>
          <p class="catalog-price">$${precio}</p>
          <p class="catalog-desc">${descripcion}</p>
          <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="catalog-btn">
            <i class="fa-brands fa-whatsapp"></i> Comprar por WhatsApp
          </a>
        </div>
      `;
      catalogContainer.appendChild(card);
    });
  }

  /* ==========================================
     EVENTOS DE FILTROS Y BUSCADOR
     ========================================== */
  if (filterPills) {
    filterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;

      // Quitar activo de todos
      filterPills.querySelectorAll('.filter-pill').forEach((p) => {
        p.classList.remove('active');
      });
      btn.classList.add('active');

      categoriaActiva = btn.dataset.filter || 'all';
      aplicarFiltros();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      textoBusqueda = e.target.value;
      aplicarFiltros();
    });
  }

  /* ==========================================
     INICIALIZACIÓN
     ========================================== */
  cargarProductos();
});