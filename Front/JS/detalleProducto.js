let variantesProducto = [];
let recargoActual = 0;
let cuotasActuales = 1;
let idInventarioSeleccionado = null; // Guardamos el talle elegido para el carrito

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id') || 1; 

    // Petición al backend real
    fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`)
        .then(response => response.json())
        .then(data => {
            // Validamos que el backend responda con éxito y tenga elementos
            if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {
                alert("Producto no encontrado o sin stock disponible");
                return;
            }

            // Guardamos todas las filas como nuestras variantes (talles)
            variantesProducto = data.payload; 

            // Tomamos la primera variante para extraer los datos generales del producto
            const prod = variantesProducto[0];

            // Inyectar datos básicos usando los nombres EXACTOS de tu base de datos
            document.getElementById("producto-imagen").src = prod.ulrImagen; 
            document.getElementById("producto-imagen").alt = prod.producto;
            document.getElementById("producto-nombre").innerText = prod.producto;
            document.getElementById("producto-descripcion").innerText = prod.descripcion || "Sin descripción disponible";
            
            document.getElementById("precio-base").value = prod.precio;
            actualizarPrecios();

            // Dibujar los botones de talles dinámicos
            const contenedorTalles = document.getElementById("contenedor-talles");
            contenedorTalles.innerHTML = ""; 

            variantesProducto.forEach(variante => {
                const botonTalle = document.createElement("button");
                botonTalle.type = "button";
                botonTalle.innerText = variante.talle; // Columna 'talle' de tu SQL
                botonTalle.className = "btn-talle";
                
                // Deshabilitar si no hay stock
                if (parseInt(variante.stock) === 0) {
                    botonTalle.disabled = true;
                }

                botonTalle.addEventListener("click", () => {
                    document.querySelectorAll(".btn-talle").forEach(b => b.classList.remove("seleccionado"));
                    botonTalle.classList.add("seleccionado");

                    // Guardamos el idInventario real de tu SQL
                    idInventarioSeleccionado = variante.idInventario;

                    // Actualizar el stock visual con los datos reales
                    const txtStock = document.getElementById("producto-stock");
                    txtStock.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4b5b66;"></i> ¡Quedan <strong>${variante.stock}</strong> unidades disponibles en talle ${variante.talle}!`;
                    
                    // Habilitar botón de carrito
                    document.getElementById("btn-agregar-carrito").disabled = false;
                });

                contenedorTalles.appendChild(botonTalle);
            });
        })
        .catch(error => console.error("Error al conectar con la API de Node:", error));

    // Evento del botón Añadir al Carrito
    document.getElementById("btn-agregar-carrito").addEventListener("click", () => {
        if (!idInventarioSeleccionado) return;
        console.log("Agregando al carrito el id_inventario:", idInventarioSeleccionado);
        alert(`¡Producto añadido al carrito! (ID Inventario: ${idInventarioSeleccionado})`);
    });
});

function seleccionarCuota(elemento, cuotas, recargo) {
    document.querySelectorAll(".btn-cuota-opcion").forEach(b => b.classList.remove("activo"));
    elemento.classList.add("activo");

    cuotasActuales = cuotas;
    recargoActual = recargo;
    actualizarPrecios();
}

function actualizarPrecios() {
    const precioBase = parseFloat(document.getElementById("precio-base").value);
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