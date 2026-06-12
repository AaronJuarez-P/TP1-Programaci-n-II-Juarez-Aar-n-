document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".contenedor-productos");
    const selectCategoria = document.querySelector(".categorias-ropa");
    const btnFavoritosMain = document.getElementById("boton-favoritos-main");
    const btnCarritoMain = document.getElementById("boton-carrito-main");
    const btnInicioMain = document.getElementById("boton-inicio-main");
    const btnCerrarSesionMain = document.getElementById("boton-cerrar-sesion-main");
    const btnPerfilMain = document.getElementById("boton-perfil-main");
    const API_URL = "http://localhost:4000/api/obtenerProductos";
    
    let todosLosProductos = []; 

    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");
    const haySesion = !!(idUsuario && token);

    // ================= MOSTRAR/OCULTAR BOTONES SEGUN SESION =================
    if (btnInicioMain) {
        btnInicioMain.style.display = haySesion ? "none" : "inline-flex";
        btnInicioMain.addEventListener("click", () => {
            window.location.href = "inicio.html";
        });
    }

    if (btnCerrarSesionMain) {
        btnCerrarSesionMain.style.display = haySesion ? "inline-flex" : "none";
        btnCerrarSesionMain.addEventListener("click", () => {
            mostrarConfirmacionCerrarSesion();
        });
    }

    if (btnPerfilMain) {
        btnPerfilMain.style.display = haySesion ? "inline-flex" : "none";
        btnPerfilMain.addEventListener("click", () => {
            window.location.href = "usuario.html";
        });
    }

    if (btnFavoritosMain) {
        btnFavoritosMain.addEventListener("click", () => {
            window.location.href = "favoritos.html";
        });
    }

    if (btnCarritoMain) {
        btnCarritoMain.addEventListener("click", () => {
            window.location.href = "carrito.html";
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
        selectCategoria.addEventListener("change", () => {
            aplicarFiltros();
        });
    }

    const inputBusqueda = document.querySelector('.barraBusqueda input[name="busqueda"]');
    const btnBusqueda = document.querySelector(".btn-busqueda");

    if (btnBusqueda) {
        btnBusqueda.addEventListener("click", (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                aplicarFiltros();
            }
        });
    }

    function aplicarFiltros() {
        let productosFiltrados = todosLosProductos;

        // ================= FILTRO POR CATEGORIA =================
        const categoriaSeleccionada = selectCategoria ? selectCategoria.value : "";
        if (categoriaSeleccionada && categoriaSeleccionada !== "productos") {
            productosFiltrados = productosFiltrados.filter(prod =>
                prod.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
            );
        }

        // ================= FILTRO POR BUSQUEDA =================
        const textoBusqueda = inputBusqueda
            ? inputBusqueda.value.trim().toLowerCase()
            : "";

        if (textoBusqueda !== "") {
            productosFiltrados = productosFiltrados.filter(prod =>
                prod.producto.trim().toLowerCase().substring(0).includes(textoBusqueda)
            );
        }

        mostrarProductos(productosFiltrados);
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

// -----------------------------------------------
// MODAL DE CONFIRMACION PARA CERRAR SESION
// -----------------------------------------------
function mostrarConfirmacionCerrarSesion() {
    // Evitar duplicados
    const existente = document.getElementById("overlay-cerrar-sesion");
    if (existente) existente.remove();

    const overlay = document.createElement("div");
    overlay.id = "overlay-cerrar-sesion";
    overlay.className = "overlay-modal";

    overlay.innerHTML = `
        <div class="modal-confirmacion">
            <i class="fa-solid fa-circle-exclamation modal-icono"></i>
            <h3>Cerrar sesin</h3>
            <p>Si confirms, volvers a la pantalla principal sin los privilegios de un usuario registrado (no podrs acceder al carrito, favoritos ni a tu perfil).</p>
            <div class="modal-botones">
                <button type="button" id="btn-cancelar-cierre" class="modal-btn-cancelar">Cancelar</button>
                <button type="button" id="btn-confirmar-cierre" class="modal-btn-confirmar">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("activo"));

    const cerrarModal = () => {
        overlay.classList.remove("activo");
        setTimeout(() => overlay.remove(), 200);
    };

    document.getElementById("btn-cancelar-cierre").addEventListener("click", () => {
        cerrarModal();
        window.location.href = "main.html";
    });

    document.getElementById("btn-confirmar-cierre").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("idUsuario");
        cerrarModal();
        window.location.href = "main.html";
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            cerrarModal();
            window.location.href = "main.html";
        }
    });
}