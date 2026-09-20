document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('catalog-container');

  async function cargarCatalogo() {
    try {
      const respuesta = await fetch('json/productos.json');

      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      const productos = await respuesta.json();

      productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
          <div class="catalog-img-box">
            <img src="${prod.imagen}" alt="${prod.nombre}">
          </div>
          <div class="catalog-info">
            <h4>${prod.nombre}</h4>
            <p class="catalog-price">${prod.precio}</p>
            <p class="catalog-desc">${prod.descripcion}</p>
            <button class="catalog-btn" onclick="alert('Ingresando al catálogo de: ${prod.nombre}')">
              Ingresar al catálogo
            </button>
          </div>
        `;
        container.appendChild(card);
      });

    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
      if (container) {
        container.innerHTML = `<p style="color: red; padding: 20px;">Error al cargar los productos. Intenta más tarde.</p>`;
      }
    }
  }

  cargarCatalogo();
});