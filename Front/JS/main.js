document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".contenedor-productos");
    const selectCategoria = document.querySelector(".categorias-ropa");
    const btnFavoritosMain = document.getElementById("boton-favoritos-main");
    const API_URL = "http://localhost:4000/api/obtenerProductos";
    
    let todosLosProductos = []; 

    if (btnFavoritosMain) {
        btnFavoritosMain.addEventListener("click", () => {
            window.location.href = "favoritos.html";
        });
    }

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

            todosLosProductos = data.payload; 
            mostrarProductos(todosLosProductos); 
        })
        .catch(error => {
            console.error("Error de conexión:", error);
            contenedor.innerHTML = `<p style="padding: 20px; color: red; text-align: center;">Error de conexión. Asegurate de que el comando 'node src/app.js' siga corriendo en la terminal.</p>`;
        });

    function mostrarProductos(productosAMostrar) {
        contenedor.innerHTML = ""; 

        if (productosAMostrar.length === 0) {
            contenedor.innerHTML = `<p style="padding: 40px; text-align: center; color: #556168; width: 100%;">No hay productos cargados en esta categoría actualmente.</p>`;
            return;
        }

        productosAMostrar.forEach(prod => {
            const card = document.createElement("div");
            card.className = "card-producto";
            
            card.setAttribute("data-id", prod.idProducto);
            card.style.cursor = "pointer"; 

            card.innerHTML = `
                <img src="${prod.ulrImagen}" alt="${prod.producto}">
                <h4>${prod.producto}</h4>
                <h5>ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR')}</h5>
            `;

            contenedor.appendChild(card);
        });
    }

    if (selectCategoria) {
        selectCategoria.addEventListener("change", (evento) => {
            const categoriaSeleccionada = evento.target.value; 

            if (categoriaSeleccionada === "productos" || categoriaSeleccionada === "") {
                mostrarProductos(todosLosProductos);
            } else {
                const productosFiltrados = todosLosProductos.filter(prod => 
                    prod.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
                );
                mostrarProductos(productosFiltrados);
            }
        });
    }

    contenedor.addEventListener("click", (evento) => {
        const tarjeta = evento.target.closest(".card-producto");
        if (tarjeta) {
            const idProducto = tarjeta.getAttribute("data-id");
            if (idProducto) {
                window.location.href = `detalleProducto.html?id=${idProducto}`;
            }
        }
    });
});