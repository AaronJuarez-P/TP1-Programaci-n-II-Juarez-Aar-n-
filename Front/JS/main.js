document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".contenedor-productos");

    // Ya configurado con tu puerto real 4000 de Express
    const API_URL = "http://localhost:4000/api/obtenerProductos";

    // 1. Pedir los productos reales a tu servidor Node.js
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

            const productos = data.payload;
            contenedor.innerHTML = ""; // Limpiamos el contenedor

            // 2. Crear las 30 cartas dinámicamente con sus datos reales de la BD
            productos.forEach(prod => {
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
        })
        .catch(error => {
            console.error("Error de conexión:", error);
            contenedor.innerHTML = `<p style="padding: 20px; color: red; text-align: center;">Error de conexión. Asegurate de que el comando 'node src/app.js' siga corriendo en la terminal.</p>`;
        });

    // 3. Escuchar el clic en la carta y redirigir pasándole el ID real
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