document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".contenedor-productos");
    
    // 1. Buscamos tu select usando la clase exacta que tenés en el HTML
    const selectCategoria = document.querySelector(".categorias-ropa");

    // Configurado con tu puerto real 4000 de Express
    const API_URL = "http://localhost:4000/api/obtenerProductos";
    
    let todosLosProductos = []; // Guardará los 30 productos originales de la BD

    // 2. Pedir los productos reales a tu servidor Node.js
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.codigo !== 200 || !data.payload) {
                console.error("Error en los datos del backend:", data.mensaje);
                return;
            }

            todosLosProductos = data.payload; // Guardamos la lista completa original
            mostrarProductos(todosLosProductos); // Al iniciar, dibuja todos los productos
        })
        .catch(error => {
            console.error("Error de conexión:", error);
            contenedor.innerHTML = `<p style="padding: 20px; color: red; text-align: center;">Error de conexión. Asegurate de que el comando 'node src/app.js' siga corriendo en la terminal.</p>`;
        });

    // 3. Función encargada de dibujar las cartas dinámicamente
    function mostrarProductos(productosAMostrar) {
        contenedor.innerHTML = ""; // Limpiamos el contenedor por completo

        if (productosAMostrar.length === 0) {
            contenedor.innerHTML = `<p style="padding: 40px; text-align: center; color: #556168; width: 100%;">No hay productos cargados en esta categoría actualmente.</p>`;
            return;
        }

        productosAMostrar.forEach(prod => {
            const card = document.createElement("div");
            card.className = "card-producto";
            
            // Guardamos el idProducto único de cada artículo
            card.setAttribute("data-id", prod.idProducto);
            card.style.cursor = "pointer"; 

            // Inyectamos el contenido usando las columnas de tu consulta SQL
            card.innerHTML = `
                <img src="${prod.ulrImagen}" alt="${prod.producto}">
                <h4>${prod.producto}</h4>
                <h5>ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR')}</h5>
            `;

            contenedor.appendChild(card);
        });
    }

    // 4. Escuchar el cambio en tu menú desplegable de categorías
    if (selectCategoria) {
        selectCategoria.addEventListener("change", (evento) => {
            const categoriaSeleccionada = evento.target.value; // Captura el value del option elegido

            // Si elige "productos" vuelve a traer la lista de los 30 completa
            if (categoriaSeleccionada === "productos" || categoriaSeleccionada === "") {
                mostrarProductos(todosLosProductos);
            } else {
                // Filtra comparando el value del HTML con la columna .categoria que viene de tu BD
                const productosFiltrados = todosLosProductos.filter(prod => 
                    prod.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
                );
                mostrarProductos(productosFiltrados);
            }
        });
    }

    // 5. Escuchar el clic en la carta y redirigir pasándole el ID real
    contenedor.addEventListener("click", (evento) => {
        const tarjeta = evento.target.closest(".card-producto");
        if (tarjeta) {
            const idProducto = tarjeta.getAttribute("data-id");
            if (idProducto) {
                // Redirige a la pantalla de detalle pasándole el ID por la URL
                window.location.href = `detalleProducto.html?id=${idProducto}`;
            }
        }
    });
});