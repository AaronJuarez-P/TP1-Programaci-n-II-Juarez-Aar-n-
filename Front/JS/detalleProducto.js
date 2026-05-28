let variantesProducto = [];
let recargoActual = 0;
let cuotasActuales = 1;
let idInventarioSeleccionado = null; 

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id') || 1; 
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");
    const btnFavoritos = document.getElementById("btn-agregar-favoritos");

    // 1. OBTENER FAVORITOS AL CARGAR LA PÁGINA
    if (idUsuario && token) {
        fetch(`http://localhost:4000/api/obtenerFavoritos/${idUsuario}`, {
            headers: { "Authorization": token }
        })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200 && data.payload) {
                const esFavorito = data.payload.some(fav => String(fav.idProducto) === String(idProducto));
                if (esFavorito) {
                    btnFavoritos.classList.add("activo"); // Usa .activo de tu CSS
                }
            }
        })
        .catch(error => console.error("Error al obtener favoritos:", error));
    }

    // 2. OBTENER DATOS DEL PRODUCTO Y SUS TALLES
    fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {
                alert("Producto no encontrado o sin stock disponible");
                return;
            }

            variantesProducto = data.payload; 
            const prod = variantesProducto[0];

            document.getElementById("producto-imagen").src = prod.urlImagen || prod.ulrImagen; 
            document.getElementById("producto-imagen").alt = prod.producto;
            document.getElementById("producto-nombre").innerText = prod.producto;
            document.getElementById("producto-descripcion").innerText = prod.descripcion || "Sin descripción disponible";
            
            document.getElementById("precio-base").value = prod.precio;
            actualizarPrecios();

            const contenedorTalles = document.getElementById("contenedor-talles");
            contenedorTalles.innerHTML = ""; 

            variantesProducto.forEach(variante => {
                const botonTalle = document.createElement("button");
                botonTalle.type = "button";
                botonTalle.innerText = variante.talle; 
                botonTalle.className = "btn-talle";
                
                if (parseInt(variante.stock) === 0) {
                    botonTalle.disabled = true;
                }

                botonTalle.addEventListener("click", () => {
                    document.querySelectorAll(".btn-talle").forEach(b => b.classList.remove("seleccionado"));
                    botonTalle.classList.add("seleccionado");

                    idInventarioSeleccionado = variante.idInventario;

                    const txtStock = document.getElementById("producto-stock");
                    txtStock.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4b5b66;"></i> ¡Quedan <strong>${variante.stock}</strong> unidades disponibles en talle ${variante.talle}!`;
                    
                    document.getElementById("btn-agregar-carrito").disabled = false;
                });

                contenedorTalles.appendChild(botonTalle);
            });
        })
        .catch(error => console.error("Error al cargar el producto:", error));

    // 3. EVENTO: AGREGAR AL CARRITO (CON CONTROL DE STOCK MÁXIMO)
    document.getElementById("btn-agregar-carrito").addEventListener("click", () => {
        if (!idInventarioSeleccionado) return;

        const varianteElegida = variantesProducto.find(v => v.idInventario === idInventarioSeleccionado);
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const existe = carrito.find(item => item.idInventario === idInventarioSeleccionado);
        
        const cantidadEnCarrito = existe ? existe.cantidad : 0;
        if (cantidadEnCarrito >= varianteElegida.stock) {
            mostrarAnuncio(`Límite alcanzado. Solo quedan ${varianteElegida.stock} unidades.`, "fa-circle-exclamation");
            return;
        }

        if (existe) {
            existe.cantidad += 1;
        } else {
            const productoCarrito = {
                idInventario: varianteElegida.idInventario,
                nombre: varianteElegida.producto,
                talle: varianteElegida.talle,
                precio: parseFloat(document.getElementById("precio-base").value),
                imagen: varianteElegida.urlImagen || varianteElegida.ulrImagen,
                cantidad: 1
            };
            carrito.push(productoCarrito);
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarAnuncio("¡Añadido al carrito!", "fa-cart-shopping");
    });

    // 4. EVENTO: BOTÓN DE FAVORITOS (TOGGLE + ANUNCIO VISUAL)
    btnFavoritos.addEventListener("click", () => {
        if (!idUsuario || !token) {
            mostrarAnuncio("Inicia sesión para guardar favoritos", "fa-circle-exclamation");
            return;
        }

        const estaEnFavoritos = btnFavoritos.classList.contains("activo"); // Cambiado a .activo
        const url = estaEnFavoritos ? "http://localhost:4000/api/eliminarFavorito" : "http://localhost:4000/api/agregarFavorito";
        const metodo = estaEnFavoritos ? "DELETE" : "POST";

        fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ id_usuario: idUsuario, id_producto: idProducto })
        })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200) {
                btnFavoritos.classList.toggle("activo"); // Conmuta la clase .activo de tu CSS
                
                if (estaEnFavoritos) {
                    mostrarAnuncio("Eliminado de favoritos", "fa-heart-crack");
                } else {
                    mostrarAnuncio("¡Guardado en favoritos!", "fa-heart");
                }
            } else {
                mostrarAnuncio("Error al actualizar favoritos", "fa-circle-exclamation");
            }
        })
        .catch(error => {
            console.error("Error en favoritos:", error);
            mostrarAnuncio("Error de red o servidor", "fa-circle-exclamation");
        });
    });
});

// 5. FUNCIONES DE CUOTAS Y PRECIOS
function seleccionarCuota(elemento, cuotas, recargo) {
    document.querySelectorAll(".btn-cuota-opcion").forEach(b => b.classList.remove("activo"));
    elemento.classList.add("activo");

    cuotasActuales = cuotas;
    recargoActual = recargo;
    actualizarPrecios();
}

function actualizarPrecios() {
    const inputPrecioBase = document.getElementById("precio-base");
    if (!inputPrecioBase || !inputPrecioBase.value) return;

    const precioBase = parseFloat(inputPrecioBase.value);
    const precioFinal = precioBase * (1 + recargoActual);
    const valorCuota = precioFinal / cuotasActuales;

    document.getElementById("precio-final").innerText = `ARS$ ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const txtCuota = document.getElementById("precio-por-cuota");
    if (cuotasActuales === 1) {
        txtCuota.innerText = "Pago único en efectivo, débito o transferencia bancaria.";
    } else {
        txtCuota.innerText = `${cuotasActuales} cuotas fijas de ARS$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} al mes.`;
    }
}

// 6. FUNCIÓN ADAPTADA A TU CONFIGURACIÓN DE CSS (`#contenedor-notificaciones` y `.cartel-notificacion`)
function mostrarAnuncio(mensaje, iconoClase = "fa-heart") {
    let contenedor = document.getElementById("contenedor-notificaciones");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-notificaciones";
        document.body.appendChild(contenedor);
    }

    const anuncio = document.createElement("div");
    anuncio.className = "cartel-notificacion"; // Usa tu clase CSS exacta
    
    // Inyecta el ícono dinámico que le mandemos y el mensaje
    anuncio.innerHTML = `<i class="fa-solid ${iconoClase}"></i> <span>${mensaje}</span>`;
    contenedor.appendChild(anuncio);

    // Pequeño timeout para activar el transform CSS
    setTimeout(() => {
        anuncio.classList.add("mostrar");
    }, 50);

    // Desvanece y elimina el nodo tras 3 segundos
    setTimeout(() => {
        anuncio.classList.remove("mostrar");
        setTimeout(() => {
            anuncio.remove();
        }, 350); // Tiempo justo que dura tu transición CSS (.35s)
    }, 3000);
}