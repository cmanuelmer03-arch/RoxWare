document.addEventListener('DOMContentLoaded', async () => {
  // Proteger ruta verificando sesión real de Supabase
const { data: { user }, error } = await supabaseClient.auth.getUser();

if (error || !user) {
  alert('Acceso restringido. Por favor inicia sesión.');
  window.location.href = 'index.html';
  return;
}

  if (!session) {
    alert('Acceso restringido. Por favor inicia sesión.');
    window.location.href = 'index.html';
    return;
  }

  cargarProductosAdmin();

  const formulario = document.getElementById('form-producto');
  if (formulario) {
    formulario.addEventListener('submit', guardarProducto);
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    });
  }
});

document.body.style.visibility = 'visible';

async function guardarProducto(e) {
  e.preventDefault();

  const nombre      = document.getElementById('nombre').value.trim();
  const precio      = parseFloat(document.getElementById('precio').value);
  const categoria   = document.getElementById('categoria').value;
  const descripcion = document.getElementById('descripcion').value.trim();
  const imagen_url  = document.getElementById('imagen_url').value.trim();

  // Validación rápida
  if (!categoria) {
    alert('⚠️ Por favor selecciona una categoría.');
    return;
  }

  const { error } = await supabaseClient
    .from('productos')
    .insert([{ nombre, precio, categoria, descripcion, imagen_url }])
    .select();

  if (error) {
    alert('⚠️ Error de Supabase: ' + error.message);
  } else {
    alert('✅ ¡Producto guardado exitosamente!');
    document.getElementById('form-producto').reset();
    cargarProductosAdmin();
  }
}

async function cargarProductosAdmin() {
  const contenedor = document.getElementById('contenedor-admin-productos');
  if (!contenedor) return;

  contenedor.innerHTML = '<p>Cargando lista de productos...</p>';

  const { data: productos, error } = await supabaseClient
    .from('productos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    contenedor.innerHTML = '<p>Error al cargar productos.</p>';
    return;
  }

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = '<p>No hay productos en la base de datos.</p>';
    return;
  }

  // Mapa de categorías para mostrar etiquetas legibles
  const etiquetasCategoria = {
    filtros:   'Sistema de filtros',
    sartenes:  'Sartenes y cocina',
    botellas:  'Botellas térmicas',
    otros:     'Otros'
  };

  contenedor.innerHTML = productos.map(p => {
    const cat = p.categoria || 'otros';
    const label = etiquetasCategoria[cat] || 'Otros';

    return `
      <div class="catalog-card">
          <div class="catalog-img-box">
              <img src="${p.imagen_url || 'https://via.placeholder.com/260x180?text=Sin+Imagen'}" alt="${p.nombre}">
          </div>
          <div class="catalog-info">
              <span class="catalog-category">${label}</span>
              <h4>${p.nombre}</h4>
              <p class="catalog-price">$${parseFloat(p.precio).toFixed(2)}</p>
              <p class="catalog-desc">${p.descripcion || ''}</p>
              <button onclick="eliminarProducto(${p.id})" class="catalog-btn btn-danger" style="background-color: #e74c3c;">Eliminar</button>
          </div>
      </div>
    `;
  }).join('');
}

async function eliminarProducto(id) {
  if (confirm('¿Deseas eliminar este producto de Supabase?')) {
    const { error } = await supabaseClient
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      cargarProductosAdmin();
    }
  }
}