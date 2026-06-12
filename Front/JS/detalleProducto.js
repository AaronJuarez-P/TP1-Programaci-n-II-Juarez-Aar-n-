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

    // ── BOTONES DEL HEADER ──────────────────────────────────────────────────
    const btnIrCarrito = document.getElementById("btn-ir-carrito-header");
    const btnIrFavoritos = document.getElementById("btn-ir-favoritos-header");

    if (btnIrCarrito) {
        btnIrCarrito.addEventListener("click", () => {
            window.location.href = "carrito.html";
        });
    }

    if (btnIrFavoritos) {
        btnIrFavoritos.addEventListener("click", () => {
            window.location.href = "favoritos.html";
        });
    }

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
                    btnFavoritos.classList.add("activo");
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

    // 3. EVENTO: AGREGAR AL CARRITO (guarda cuotas, recargo y precio final)
    document.getElementById("btn-agregar-carrito").addEventListener("click", () => {
        if (!idUsuario || !token) {
            mostrarAnuncio("Inicia sesin para agregar productos al carrito", "fa-circle-exclamation");
            return;
        }

        if (!idInventarioSeleccionado) return;

        const varianteElegida = variantesProducto.find(v => v.idInventario === idInventarioSeleccionado);
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const existe = carrito.find(item => item.idInventario === idInventarioSeleccionado);
        
        const cantidadEnCarrito = existe ? existe.cantidad : 0;
        if (cantidadEnCarrito >= varianteElegida.stock) {
            mostrarAnuncio(`Límite alcanzado. Solo quedan ${varianteElegida.stock} unidades.`, "fa-circle-exclamation");
            return;
        }

        const precioBase = parseFloat(document.getElementById("precio-base").value);
        const precioConRecargo = precioBase * (1 + recargoActual);

        if (existe) {
            // Si el producto ya está en el carrito, solo suma cantidad
            existe.cantidad += 1;
        } else {
            // Arma el objeto con toda la info de cuotas
            const productoCarrito = {
                idInventario: varianteElegida.idInventario,
                idProducto: idProducto,
                nombre: varianteElegida.producto,
                categoria: varianteElegida.categoria || "",
                talle: varianteElegida.talle,
                precioBase: precioBase,
                recargo: recargoActual,
                cuotas: cuotasActuales,
                precioFinal: precioConRecargo,
                imagen: varianteElegida.urlImagen || varianteElegida.ulrImagen,
                cantidad: 1
            };
            carrito.push(productoCarrito);
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));

        // Texto del anuncio según cuotas elegidas
        let textoAnuncio = "¡Añadido al carrito!";
        if (cuotasActuales > 1) {
            const valorCuota = precioConRecargo / cuotasActuales;
            textoAnuncio = `¡Añadido! ${cuotasActuales} cuotas de ARS$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        mostrarAnuncio(textoAnuncio, "fa-cart-shopping");
    });

    // 4. EVENTO: BOTÓN DE FAVORITOS (TOGGLE + ANUNCIO VISUAL)
    btnFavoritos.addEventListener("click", () => {
        if (!idUsuario || !token) {
            mostrarAnuncio("Inicia sesión para guardar favoritos", "fa-circle-exclamation");
            return;
        }

        const estaEnFavoritos = btnFavoritos.classList.contains("activo");
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
                btnFavoritos.classList.toggle("activo");
                
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

// 6. FUNCIÓN DE NOTIFICACIONES
function mostrarAnuncio(mensaje, iconoClase = "fa-heart") {
    let contenedor = document.getElementById("contenedor-notificaciones");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-notificaciones";
        document.body.appendChild(contenedor);
    }

    const anuncio = document.createElement("div");
    anuncio.className = "cartel-notificacion";
    anuncio.innerHTML = `<i class="fa-solid ${iconoClase}"></i> <span>${mensaje}</span>`;
    contenedor.appendChild(anuncio);

    setTimeout(() => {
        anuncio.classList.add("mostrar");
    }, 50);

    setTimeout(() => {
        anuncio.classList.remove("mostrar");
        setTimeout(() => {
            anuncio.remove();
        }, 350);
    }, 3000);
}
