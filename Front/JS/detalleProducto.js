//Variables globales para manejar el estado del producto y la financiacion
let variantesProducto = [];
let recargoActual = 0;
let cuotasActuales = 1;
//Almacena el id del inventario del talle seleccionado
let idInventarioSeleccionado = null; 

document.addEventListener("DOMContentLoaded", () => {
    //Obtiene los parametros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    //Obtiene el id del producto de la URL, por defecto 1 si no existe
    const idProducto = urlParams.get('id') || 1; 
    //Trae el id del usuario y el token guardados en el localStorage
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");
    //Trae el boton de agregar a favoritos del DOM
    const btnFavoritos = document.getElementById("btn-agregar-favoritos");

    // ── BOTONES DEL HEADER ──────────────────────────────────────────────────
    //Trae los botones de navegacion del header del DOM
    const btnIrCarrito = document.getElementById("btn-ir-carrito-header");
    const btnIrFavoritos = document.getElementById("btn-ir-favoritos-header");

    //Al hacer click en el boton del carrito redirige a la pagina del carrito
    if (btnIrCarrito) {
        btnIrCarrito.addEventListener("click", () => {
            window.location.href = "carrito.html";
        });
    }

    //Al hacer click en el boton de favoritos redirige a la pagina de favoritos
    if (btnIrFavoritos) {
        btnIrFavoritos.addEventListener("click", () => {
            window.location.href = "favoritos.html";
        });
    }

    // 1. OBTENER FAVORITOS AL CARGAR LA PÁGINA
    //Si hay sesion activa consulta si el producto actual ya esta en favoritos
    if (idUsuario && token) {
        fetch(`http://localhost:4000/api/obtenerFavoritos/${idUsuario}`, {
            headers: { "Authorization": token }
        })
        .then(response => response.json())
        .then(data => {
            //Si la respuesta es correcta y trae datos verifica si el producto esta en favoritos
            if (data.codigo === 200 && data.payload) {
                //Compara el id del producto actual con los ids de los favoritos del usuario
                const esFavorito = data.payload.some(fav => String(fav.idProducto) === String(idProducto));
                //Si es favorito agrega la clase "activo" al boton para marcarlo visualmente
                if (esFavorito) {
                    btnFavoritos.classList.add("activo");
                }
            }
        })
        .catch(error => console.error("Error al obtener favoritos:", error));
    }

    // 2. OBTENER DATOS DEL PRODUCTO Y SUS TALLES
    //Consulta la API para obtener los datos del producto y sus variantes de talle
    fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            //Si la respuesta no es correcta o no hay datos muestra un mensaje y corta la ejecucion
            if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {
                alert("Producto no encontrado o sin stock disponible");
                return;
            }

            //Guarda todas las variantes del producto en la variable global
            variantesProducto = data.payload; 
            //Toma la primera variante como referencia para los datos generales del producto
            const prod = variantesProducto[0];

            //Rellena los elementos del DOM con los datos del producto
            document.getElementById("producto-imagen").src = prod.urlImagen || prod.ulrImagen; 
            document.getElementById("producto-imagen").alt = prod.producto;
            document.getElementById("producto-nombre").innerText = prod.producto;
            document.getElementById("producto-descripcion").innerText = prod.descripcion || "Sin descripción disponible";
            
            //Guarda el precio base en el input oculto y actualiza los precios mostrados
            document.getElementById("precio-base").value = prod.precio;
            actualizarPrecios();

            //Limpia el contenedor de talles antes de renderizar los botones
            const contenedorTalles = document.getElementById("contenedor-talles");
            contenedorTalles.innerHTML = ""; 

            //Recorre cada variante y crea un boton de talle por cada una
            variantesProducto.forEach(variante => {
                const botonTalle = document.createElement("button");
                botonTalle.type = "button";
                botonTalle.innerText = variante.talle; 
                botonTalle.className = "btn-talle";
                
                //Deshabilita el boton si el stock de esa variante es 0
                if (parseInt(variante.stock) === 0) {
                    botonTalle.disabled = true;
                }

                //Al hacer click en un talle lo marca como seleccionado y actualiza el stock mostrado
                botonTalle.addEventListener("click", () => {
                    //Quita la clase "seleccionado" de todos los botones de talle
                    document.querySelectorAll(".btn-talle").forEach(b => b.classList.remove("seleccionado"));
                    //Marca el boton clickeado como seleccionado
                    botonTalle.classList.add("seleccionado");

                    //Guarda el id del inventario de la variante seleccionada
                    idInventarioSeleccionado = variante.idInventario;

                    //Muestra el stock disponible para el talle seleccionado
                    const txtStock = document.getElementById("producto-stock");
                    txtStock.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4b5b66;"></i> ¡Quedan <strong>${variante.stock}</strong> unidades disponibles en talle ${variante.talle}!`;
                    
                    //Habilita el boton de agregar al carrito una vez elegido el talle
                    document.getElementById("btn-agregar-carrito").disabled = false;
                });

                contenedorTalles.appendChild(botonTalle);
            });
        })
        .catch(error => console.error("Error al cargar el producto:", error));

    // 3. EVENTO: AGREGAR AL CARRITO (guarda cuotas, recargo y precio final)
    document.getElementById("btn-agregar-carrito").addEventListener("click", () => {
        //Si no hay sesion activa muestra un anuncio y corta la ejecucion
        if (!idUsuario || !token) {
            mostrarAnuncio("Inicia sesin para agregar productos al carrito", "fa-circle-exclamation");
            return;
        }

        //Si no hay talle seleccionado corta la ejecucion
        if (!idInventarioSeleccionado) return;

        //Busca la variante elegida dentro del array de variantes del producto
        const varianteElegida = variantesProducto.find(v => v.idInventario === idInventarioSeleccionado);
        //Obtiene el carrito actual del localStorage o un array vacio si no existe
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        //Busca si el item ya existe en el carrito
        const existe = carrito.find(item => item.idInventario === idInventarioSeleccionado);
        
        //Obtiene la cantidad actual del item en el carrito, 0 si no existe
        const cantidadEnCarrito = existe ? existe.cantidad : 0;
        //Si ya se alcanzo el limite de stock muestra un anuncio y corta la ejecucion
        if (cantidadEnCarrito >= varianteElegida.stock) {
            mostrarAnuncio(`Límite alcanzado. Solo quedan ${varianteElegida.stock} unidades.`, "fa-circle-exclamation");
            return;
        }

        //Calcula el precio final aplicando el recargo por cuotas
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
            //Agrega el nuevo producto al array del carrito
            carrito.push(productoCarrito);
        }

        //Guarda el carrito actualizado en el localStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));

        //Arma el texto del anuncio segun si se eligieron cuotas o pago contado
        let textoAnuncio = "¡Añadido al carrito!";
        if (cuotasActuales > 1) {
            const valorCuota = precioConRecargo / cuotasActuales;
            textoAnuncio = `¡Añadido! ${cuotasActuales} cuotas de ARS$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        mostrarAnuncio(textoAnuncio, "fa-cart-shopping");
    });

    // 4. EVENTO: BOTÓN DE FAVORITOS (TOGGLE + ANUNCIO VISUAL)
    btnFavoritos.addEventListener("click", () => {
        //Si no hay sesion activa muestra un anuncio y corta la ejecucion
        if (!idUsuario || !token) {
            mostrarAnuncio("Inicia sesión para guardar favoritos", "fa-circle-exclamation");
            return;
        }

        //Verifica si el boton ya tiene la clase "activo" para saber el estado actual
        const estaEnFavoritos = btnFavoritos.classList.contains("activo");
        //Elige la URL y el metodo HTTP segun si se va a agregar o eliminar el favorito
        const url = estaEnFavoritos ? "http://localhost:4000/api/eliminarFavorito" : "http://localhost:4000/api/agregarFavorito";
        const metodo = estaEnFavoritos ? "DELETE" : "POST";

        //Envia la peticion a la API para agregar o eliminar el favorito
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
            //Si la respuesta es correcta alterna la clase "activo" y muestra el anuncio correspondiente
            if (data.codigo === 200) {
                btnFavoritos.classList.toggle("activo");
                
                //Muestra un anuncio distinto segun si se elimino o agrego a favoritos
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
//Marca el boton de cuota clickeado como activo y actualiza las variables globales de cuotas y recargo
function seleccionarCuota(elemento, cuotas, recargo) {
    //Quita la clase "activo" de todos los botones de cuota
    document.querySelectorAll(".btn-cuota-opcion").forEach(b => b.classList.remove("activo"));
    //Marca el boton clickeado como activo
    elemento.classList.add("activo");

    //Actualiza las variables globales con los valores de la cuota seleccionada
    cuotasActuales = cuotas;
    recargoActual = recargo;
    //Recalcula y muestra los precios con el nuevo recargo
    actualizarPrecios();
}

//Calcula el precio final con recargo y actualiza los textos de precio y cuotas en el DOM
function actualizarPrecios() {
    //Obtiene el input oculto con el precio base
    const inputPrecioBase = document.getElementById("precio-base");
    //Corta la ejecucion si el input no existe o no tiene valor
    if (!inputPrecioBase || !inputPrecioBase.value) return;

    //Calcula el precio final aplicando el recargo y el valor de cada cuota
    const precioBase = parseFloat(inputPrecioBase.value);
    const precioFinal = precioBase * (1 + recargoActual);
    const valorCuota = precioFinal / cuotasActuales;

    //Actualiza el texto del precio final en el DOM
    document.getElementById("precio-final").innerText = `ARS$ ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //Muestra un texto diferente segun si es pago en cuotas o pago unico
    const txtCuota = document.getElementById("precio-por-cuota");
    if (cuotasActuales === 1) {
        txtCuota.innerText = "Pago único en efectivo, débito o transferencia bancaria.";
    } else {
        txtCuota.innerText = `${cuotasActuales} cuotas fijas de ARS$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} al mes.`;
    }
}

// 6. FUNCIÓN DE NOTIFICACIONES
//Muestra un cartel de notificacion con un mensaje e icono que desaparece automaticamente
function mostrarAnuncio(mensaje, iconoClase = "fa-heart") {
    //Busca el contenedor de notificaciones, si no existe lo crea y lo agrega al body
    let contenedor = document.getElementById("contenedor-notificaciones");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-notificaciones";
        document.body.appendChild(contenedor);
    }

    //Crea el elemento del anuncio con el icono y el mensaje
    const anuncio = document.createElement("div");
    anuncio.className = "cartel-notificacion";
    anuncio.innerHTML = `<i class="fa-solid ${iconoClase}"></i> <span>${mensaje}</span>`;
    contenedor.appendChild(anuncio);

    //Agrega la clase "mostrar" con un pequeño retraso para activar la animacion CSS
    setTimeout(() => {
        anuncio.classList.add("mostrar");
    }, 50);

    //Quita la clase "mostrar" y elimina el elemento del DOM luego de 3 segundos
    setTimeout(() => {
        anuncio.classList.remove("mostrar");
        setTimeout(() => {
            anuncio.remove();
        }, 350);
    }, 3000);
}
