//Se dispara al haber terminado de cargar todo el HTML
document.addEventListener("DOMContentLoaded", () => {

    //Trae el primer elemento que coincida con la clase
    const selectCategoria = document.querySelector(".categorias-ropa");

    // Trae todos los elementos del carrito
    let todosLosItems = obtenerCarrito();

    renderizarCarrito(todosLosItems);

    if (selectCategoria) {
        //Al cambiar el valor de categoria se dispara el evento
        selectCategoria.addEventListener("change", (e) => {
            //Variable que almacena el valor del elemento que disparo el evento
            const categoria = e.target.value;

            //Se almacena el resultado de la condicion, si categoria es igual a productos o igual a vacio
            const filtrados = (categoria === "productos" || categoria === "")
            //Si el resultado es igual a productos o vacio no pasa nada, si es igual a otro valor filtra
                ? todosLosItems
                //Recorre todos los items de un array hasta los que cumplen con la categoria
                : todosLosItems.filter(item =>
                    (item.categoria || "").toLowerCase() === categoria.toLowerCase()
                );

                //Muestra los productos del carrito con la respuesta de la variable filtrados
            renderizarCarrito(filtrados, true);
        });
    }

    //Al apretar el boton se dispara el evento que muestra un mensaje en un cartel
    const btnConfirmar = document.getElementById("btn-confirmar-pedido");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            mostrarAnuncio("¡Pedido confirmado! Pronto nos ponemos en contacto.", "fa-circle-check");
        });
    }
});

//
function renderizarCarrito(items, esFiltrado = false) {
    const lista = document.getElementById("lista-carrito");
    const carritoVacio = document.getElementById("carrito-vacio");
    const resumenBloque = document.getElementById("carrito-resumen-bloque");
    const btnConfirmar = document.getElementById("btn-confirmar-pedido");

    lista.innerHTML = "";

    // Si no es filtrado, actualizar el estado global
    if (!esFiltrado) {
        actualizarLabelCantidad(items.reduce((acc, i) => acc + i.cantidad, 0));
    }

    if (items.length === 0 && !esFiltrado) {
        carritoVacio.style.display = "flex";
        resumenBloque.style.display = "none";
        if (btnConfirmar) btnConfirmar.disabled = true;
        actualizarResumen([]);
        return;
    }

    carritoVacio.style.display = "none";
    resumenBloque.style.display = "block";
    if (btnConfirmar) btnConfirmar.disabled = false;

    if (items.length === 0 && esFiltrado) {
        lista.innerHTML = `<p class="sin-carrito-texto">No hay productos en esta categoría.</p>`;
        actualizarResumen([]);
        return;
    }

    items.forEach(item => {
        const precioFinalItem = item.precioFinal !== undefined ? item.precioFinal : item.precio || 0;
        const precioBase = item.precioBase !== undefined ? item.precioBase : item.precio || 0;
        const cuotas = item.cuotas || 1;
        const recargo = item.recargo || 0;

        // Texto de financiación para mostrar en la tarjeta
        let textoFinanciacion = "Contado";
        if (cuotas > 1) {
            const valorCuota = precioFinalItem / cuotas;
            textoFinanciacion = `${cuotas} cuotas de ARS$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        const div = document.createElement("div");
        div.className = "card-producto";
        div.setAttribute("data-id", item.idInventario);

        div.innerHTML = `
            <img
                src="${item.imagen || ''}"
                alt="${item.nombre}"
                onerror="this.style.display='none'"
            >
            <div class="info-producto">
                <h4>${item.nombre}</h4>
                <p class="carrito-item-talle">Talle: <strong>${item.talle}</strong></p>
                <p class="precio-producto">
                    ARS$ ${(precioFinalItem * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p class="carrito-item-financiacion">${textoFinanciacion}</p>
                <div class="carrito-controles-cantidad">
                    <button type="button" class="btn-cantidad btn-menos" data-id="${item.idInventario}">−</button>
                    <span class="cantidad-numero">${item.cantidad}</span>
                    <button type="button" class="btn-cantidad btn-mas" data-id="${item.idInventario}">+</button>
                </div>
                <a href="detalleProducto.html?id=${item.idProducto || ''}" class="btn-ver-producto">
                    Ver producto
                </a>
            </div>
            <button type="button" class="btn-quitar-fav btn-eliminar-carrito" data-id="${item.idInventario}" title="Eliminar del carrito">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        // Eventos de cantidad
        div.querySelector(".btn-menos").addEventListener("click", () => {
            cambiarCantidad(item.idInventario, -1);
        });
        div.querySelector(".btn-mas").addEventListener("click", () => {
            cambiarCantidad(item.idInventario, 1);
        });

        // Evento eliminar
        div.querySelector(".btn-eliminar-carrito").addEventListener("click", () => {
            eliminarItem(item.idInventario);
        });

        lista.appendChild(div);
    });

    // El resumen siempre se calcula sobre el carrito completo (no el filtrado)
    actualizarResumen(obtenerCarrito());
}

// -----------------------------------------------
// CAMBIAR CANTIDAD DE UN ITEM
// -----------------------------------------------
function cambiarCantidad(idInventario, delta) {
    let carrito = obtenerCarrito();
    const item = carrito.find(i => i.idInventario === idInventario);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.idInventario !== idInventario);
        mostrarAnuncio("Producto eliminado del carrito", "fa-trash");
    }

    guardarCarrito(carrito);

    // Re-renderizar respetando el filtro activo
    const selectCategoria = document.querySelector(".categorias-ropa");
    const categoriaActual = selectCategoria ? selectCategoria.value : "";
    const todosLosItems = obtenerCarrito();

    const itemsFiltrados = (categoriaActual === "productos" || categoriaActual === "" || !categoriaActual)
        ? todosLosItems
        : todosLosItems.filter(i => (i.categoria || "").toLowerCase() === categoriaActual.toLowerCase());

    renderizarCarrito(itemsFiltrados, categoriaActual !== "" && categoriaActual !== "productos");
    actualizarLabelCantidad(todosLosItems.reduce((acc, i) => acc + i.cantidad, 0));
}

// -----------------------------------------------
// ELIMINAR UN ITEM COMPLETO
// -----------------------------------------------
function eliminarItem(idInventario) {
    let carrito = obtenerCarrito().filter(i => i.idInventario !== idInventario);
    guardarCarrito(carrito);
    mostrarAnuncio("Producto eliminado del carrito", "fa-trash");

    const selectCategoria = document.querySelector(".categorias-ropa");
    const categoriaActual = selectCategoria ? selectCategoria.value : "";
    const todosLosItems = obtenerCarrito();

    const itemsFiltrados = (categoriaActual === "productos" || categoriaActual === "" || !categoriaActual)
        ? todosLosItems
        : todosLosItems.filter(i => (i.categoria || "").toLowerCase() === categoriaActual.toLowerCase());

    renderizarCarrito(itemsFiltrados, categoriaActual !== "" && categoriaActual !== "productos");
    actualizarLabelCantidad(todosLosItems.reduce((acc, i) => acc + i.cantidad, 0));
}

// -----------------------------------------------
// ACTUALIZAR RESUMEN DE PRECIOS (con recargos por cuotas)
// -----------------------------------------------
function actualizarResumen(carrito) {
    // Suma precio final (con recargo) × cantidad de cada item
    const subtotal = carrito.reduce((acc, item) => {
        const precio = item.precioFinal !== undefined ? item.precioFinal : (item.precio || 0);
        return acc + precio * item.cantidad;
    }, 0);

    const subtotalEl = document.getElementById("resumen-subtotal");
    const totalEl = document.getElementById("resumen-total");

    if (subtotalEl) subtotalEl.innerText = `ARS$ ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalEl) totalEl.innerText = `ARS$ ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// -----------------------------------------------
// ACTUALIZAR LABEL DE CANTIDAD EN ENCABEZADO
// -----------------------------------------------
function actualizarLabelCantidad(total) {
    const label = document.getElementById("carrito-cantidad-label");
    if (label) label.innerText = total === 1 ? "1 producto" : `${total} productos`;
}

// -----------------------------------------------
// HELPERS: localStorage
// -----------------------------------------------
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// -----------------------------------------------
// TOAST DE NOTIFICACIONES
// -----------------------------------------------
function mostrarAnuncio(mensaje, iconoClase = "fa-circle-check") {
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

    setTimeout(() => anuncio.classList.add("mostrar"), 50);

    setTimeout(() => {
        anuncio.classList.remove("mostrar");
        setTimeout(() => anuncio.remove(), 350);
    }, 3000);
}
