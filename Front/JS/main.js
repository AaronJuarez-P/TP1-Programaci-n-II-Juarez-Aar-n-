document.addEventListener("DOMContentLoaded", () => {
    //Trae del DOM el contenedor de productos y el selector de categoria
    const contenedor = document.querySelector(".contenedor-productos");
    const selectCategoria = document.querySelector(".categorias-ropa");
    //Trae del DOM todos los botones del header
    const btnFavoritosMain = document.getElementById("boton-favoritos-main");
    const btnCarritoMain = document.getElementById("boton-carrito-main");
    const btnInicioMain = document.getElementById("boton-inicio-main");
    const btnCerrarSesionMain = document.getElementById("boton-cerrar-sesion-main");
    const btnPerfilMain = document.getElementById("boton-perfil-main");
    //URL de la API para obtener todos los productos
    const API_URL = "http://localhost:4000/api/obtenerProductos";
    
    //Array que almacena todos los productos para poder filtrarlos despues
    let todosLosProductos = []; 

    //Trae el id del usuario y el token guardados en el localStorage
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");
    //Variable booleana que indica si hay una sesion activa
    const haySesion = !!(idUsuario && token);

    // ================= MOSTRAR/OCULTAR BOTONES SEGUN SESION =================
    //Muestra el boton de inicio solo si no hay sesion activa y redirige al hacer click
    if (btnInicioMain) {
        btnInicioMain.style.display = haySesion ? "none" : "inline-flex";
        btnInicioMain.addEventListener("click", () => {
            window.location.href = "inicio.html";
        });
    }

    //Muestra el boton de cerrar sesion solo si hay sesion activa y abre el modal al hacer click
    if (btnCerrarSesionMain) {
        btnCerrarSesionMain.style.display = haySesion ? "inline-flex" : "none";
        btnCerrarSesionMain.addEventListener("click", () => {
            mostrarConfirmacionCerrarSesion();
        });
    }

    //Muestra el boton de perfil solo si hay sesion activa y redirige al hacer click
    if (btnPerfilMain) {
        btnPerfilMain.style.display = haySesion ? "inline-flex" : "none";
        btnPerfilMain.addEventListener("click", () => {
            window.location.href = "usuario.html";
        });
    }

    //Al hacer click en favoritos redirige a la pagina de favoritos
    if (btnFavoritosMain) {
        btnFavoritosMain.addEventListener("click", () => {
            window.location.href = "favoritos.html";
        });
    }

    //Al hacer click en carrito redirige a la pagina del carrito
    if (btnCarritoMain) {
        btnCarritoMain.addEventListener("click", () => {
            window.location.href = "carrito.html";
        });
    }

    //Consulta la API para obtener todos los productos disponibles
    fetch(API_URL)
        .then(response => {
            //Si la respuesta HTTP no es correcta lanza un error con el codigo de estado
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            //Si la respuesta no es correcta o no trae datos imprime el error y corta la ejecucion
            if (data.codigo !== 200 || !data.payload) {
                console.error("Error en los datos del backend:", data.mensaje);
                return;
            }

            //Guarda todos los productos en el array global y los muestra en pantalla
            todosLosProductos = data.payload; 
            mostrarProductos(todosLosProductos); 
        })
        .catch(error => {
            //Si hay un error de red muestra un mensaje de error en el contenedor
            console.error("Error de conexión:", error);
            contenedor.innerHTML = `<p style="padding: 20px; color: red; text-align: center;">Error de conexión. Asegurate de que el comando 'node src/app.js' siga corriendo en la terminal.</p>`;
        });

    //Renderiza las tarjetas de productos en el contenedor del DOM
    function mostrarProductos(productosAMostrar) {
        //Limpia el contenedor antes de renderizar
        contenedor.innerHTML = ""; 

        //Si no hay productos muestra un mensaje informativo
        if (productosAMostrar.length === 0) {
            contenedor.innerHTML = `<p style="padding: 40px; text-align: center; color: #556168; width: 100%;">No hay productos cargados en esta categoría actualmente.</p>`;
            return;
        }

        //Recorre cada producto y crea una tarjeta por cada uno
        productosAMostrar.forEach(prod => {
            const card = document.createElement("div");
            card.className = "card-producto";
            
            //Guarda el id del producto en el atributo data-id para usarlo al hacer click
            card.setAttribute("data-id", prod.idProducto);
            //Cambia el cursor a pointer para indicar que la tarjeta es clickeable
            card.style.cursor = "pointer"; 

            //Rellena la tarjeta con la imagen, nombre y precio del producto
            card.innerHTML = `
                <img src="${prod.ulrImagen}" alt="${prod.producto}">
                <h4>${prod.producto}</h4>
                <h5>ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR')}</h5>
            `;

            contenedor.appendChild(card);
        });
    }

    //Al cambiar la categoria aplica los filtros activos
    if (selectCategoria) {
        selectCategoria.addEventListener("change", () => {
            aplicarFiltros();
        });
    }

    //Trae del DOM el input de busqueda y el boton de busqueda
    const inputBusqueda = document.querySelector('.barraBusqueda input[name="busqueda"]');
    const btnBusqueda = document.querySelector(".btn-busqueda");

    //Al hacer click en el boton de busqueda aplica los filtros activos
    if (btnBusqueda) {
        btnBusqueda.addEventListener("click", (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    //Al presionar Enter en el input de busqueda aplica los filtros activos
    if (inputBusqueda) {
        inputBusqueda.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                aplicarFiltros();
            }
        });
    }

    //Combina el filtro de categoria y el de busqueda de texto y muestra los resultados
    function aplicarFiltros() {
        //Parte desde el array completo de productos
        let productosFiltrados = todosLosProductos;

        // ================= FILTRO POR CATEGORIA =================
        //Si hay una categoria seleccionada y no es "productos" filtra por ella
        const categoriaSeleccionada = selectCategoria ? selectCategoria.value : "";
        if (categoriaSeleccionada && categoriaSeleccionada !== "productos") {
            productosFiltrados = productosFiltrados.filter(prod =>
                prod.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
            );
        }

        // ================= FILTRO POR BUSQUEDA =================
        //Obtiene el texto ingresado en el input de busqueda en minusculas
        const textoBusqueda = inputBusqueda
            ? inputBusqueda.value.trim().toLowerCase()
            : "";

        //Si hay texto de busqueda filtra los productos cuyo nombre lo contenga
        if (textoBusqueda !== "") {
            productosFiltrados = productosFiltrados.filter(prod =>
                prod.producto.trim().toLowerCase().substring(0).includes(textoBusqueda)
            );
        }

        //Muestra los productos que pasaron ambos filtros
        mostrarProductos(productosFiltrados);
    }

    //Al hacer click en cualquier parte del contenedor detecta si fue sobre una tarjeta y redirige al detalle
    contenedor.addEventListener("click", (evento) => {
        //Busca el elemento mas cercano con la clase "card-producto" al elemento clickeado
        const tarjeta = evento.target.closest(".card-producto");
        if (tarjeta) {
            //Obtiene el id del producto del atributo data-id y redirige al detalle
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
//Crea y muestra el modal de confirmacion antes de cerrar sesion
function mostrarConfirmacionCerrarSesion() {
    //Evita duplicados eliminando el overlay si ya existe en el DOM
    const existente = document.getElementById("overlay-cerrar-sesion");
    if (existente) existente.remove();

    //Crea el elemento overlay que cubre toda la pantalla
    const overlay = document.createElement("div");
    overlay.id = "overlay-cerrar-sesion";
    overlay.className = "overlay-modal";

    //Rellena el overlay con el contenido del modal de confirmacion
    overlay.innerHTML = `
        <div class="modal-confirmacion">
            <i class="fa-solid fa-circle-exclamation modal-icono"></i>
            <h3>Cerrar sesin</h3>
            <p>Si confirmas, volveras a la pantalla principal sin los privilegios de un usuario registrado (no podras acceder al carrito, favoritos, ni a tu perfil).</p>
            <div class="modal-botones">
                <button type="button" id="btn-cancelar-cierre" class="modal-btn-cancelar">Cancelar</button>
                <button type="button" id="btn-confirmar-cierre" class="modal-btn-confirmar">Confirmar</button>
            </div>
        </div>
    `;

    //Agrega el overlay al body
    document.body.appendChild(overlay);

    //Espera un frame antes de agregar la clase "activo" para activar la animacion CSS de entrada
    requestAnimationFrame(() => overlay.classList.add("activo"));

    //Funcion que quita la clase "activo" y elimina el overlay del DOM despues de la animacion
    const cerrarModal = () => {
        overlay.classList.remove("activo");
        setTimeout(() => overlay.remove(), 200);
    };

    //Al cancelar cierra el modal y redirige al main
    document.getElementById("btn-cancelar-cierre").addEventListener("click", () => {
        cerrarModal();
        window.location.href = "main.html";
    });

    //Al confirmar elimina el token y el id del localStorage, cierra el modal y redirige al main
    document.getElementById("btn-confirmar-cierre").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("idUsuario");
        cerrarModal();
        window.location.href = "main.html";
    });

    //Al hacer click fuera del modal cierra el modal y redirige al main
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            cerrarModal();
            window.location.href = "main.html";
        }
    });
}
