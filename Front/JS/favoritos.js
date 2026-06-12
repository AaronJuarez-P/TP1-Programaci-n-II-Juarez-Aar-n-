document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.querySelector("#lista-carrito");
    const selectCategoria = document.querySelector(".categorias-ropa");
    const carritoVacio = document.getElementById("carrito-vacio");

    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    let productosFavoritos = [];

    // ================= VALIDAR SESION =================
    if (!idUsuario || !token) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    actualizarLabelCantidadFavoritos(0);

    return;
}

    // ================= OBTENER FAVORITOS =================
    fetch(`http://localhost:4000/api/obtenerFavoritos/${idUsuario}`, {
        headers: {
            "Authorization": token
        }
    })

    .then(response => response.json())

    .then(data => {

        // 🔥 IMPORTANTE: limpiar estado
        productosFavoritos = [];

        // ================= SIN FAVORITOS =================
        if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    actualizarLabelCantidadFavoritos(0);

    return;
}

        // ================= CON FAVORITOS =================
        contenedor.innerHTML = "";
carritoVacio.style.display = "none";

actualizarLabelCantidadFavoritos(data.payload.length);

        data.payload.forEach(fav => {

            fetch(`http://localhost:4000/api/obtenerDatosProducto/${fav.idProducto}`)

            .then(res => res.json())

            .then(prodData => {

                if (prodData.codigo === 200 && prodData.payload.length > 0) {

                    const prod = prodData.payload[0];

                    productosFavoritos.push({
                        ...prod,
                        idProducto: fav.idProducto
                    });

                    const tarjeta = document.createElement("div");
                    tarjeta.className = "card-producto";

                    tarjeta.innerHTML = `
                        <img src="${prod.urlImagen || prod.ulrImagen}" alt="${prod.producto}">

                        <div class="info-producto">
                            <h4>${prod.producto}</h4>

                            <p class="precio-producto">
                                ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>

                            <a href="detalleProducto.html?id=${fav.idProducto}" class="btn-ver-producto">
                                Ver producto
                            </a>
                        </div>

                        <button type="button" class="btn-quitar-fav" data-id="${fav.idProducto}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;

                    // ================= ELIMINAR =================
                    tarjeta.querySelector(".btn-quitar-fav")
                    .addEventListener("click", (e) => {

                        const idEliminar = e.currentTarget.getAttribute("data-id");

                        fetch("http://localhost:4000/api/eliminarFavorito", {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": token
                            },
                            body: JSON.stringify({
                                id_usuario: idUsuario,
                                id_producto: idEliminar
                            })
                        })
                        .then(res => res.json())
                        .then(dataDelete => {

                            if (dataDelete.codigo === 200) {

                                tarjeta.remove();

                                productosFavoritos = productosFavoritos.filter(
    p => p.idProducto != idEliminar
);

actualizarLabelCantidadFavoritos(productosFavoritos.length);

                                // ================= SI NO QUEDAN FAVORITOS =================
                                if (contenedor.children.length === 0) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    actualizarLabelCantidadFavoritos(0);
}
                            }
                        })
                        .catch(err => console.error(err));
                    });

                    contenedor.appendChild(tarjeta);
                }

            })

            .catch(err => console.error(err));
        });

    })

    .catch(error => {

        console.error(error);

        contenedor.innerHTML = "";
        carritoVacio.style.display = "flex";
    });

    // ================= FILTRO =================
    if (selectCategoria) {

        selectCategoria.addEventListener("change", (e) => {

            const categoria = e.target.value;

            contenedor.innerHTML = "";

            const filtrados = categoria === "productos" || categoria === ""
                ? productosFavoritos
                : productosFavoritos.filter(p =>
                    (p.categoria || "").toLowerCase() === categoria.toLowerCase()
                );

            filtrados.forEach(prod => {

    const tarjeta = document.createElement("div");
    tarjeta.className = "card-producto";

    tarjeta.innerHTML = `
        <img src="${prod.urlImagen || prod.ulrImagen}" alt="${prod.producto}">

        <div class="info-producto">
            <h4>${prod.producto}</h4>

            <p class="precio-producto">
                ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
            </p>

            <a href="detalleProducto.html?id=${prod.idProducto}" class="btn-ver-producto">
                Ver producto
            </a>
        </div>

        <button type="button" class="btn-quitar-fav" data-id="${prod.idProducto}">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    tarjeta.querySelector(".btn-quitar-fav")
    .addEventListener("click", (e) => {

        const idEliminar = e.currentTarget.getAttribute("data-id");

        fetch("http://localhost:4000/api/eliminarFavorito", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                id_usuario: idUsuario,
                id_producto: idEliminar
            })
        })
        .then(res => res.json())
        .then(dataDelete => {

            if (dataDelete.codigo === 200) {

                tarjeta.remove();

                productosFavoritos = productosFavoritos.filter(
                    p => p.idProducto != idEliminar
                );

                actualizarLabelCantidadFavoritos(productosFavoritos.length);

                if (contenedor.children.length === 0) {

                    contenedor.innerHTML = "";
                    carritoVacio.style.display = "flex";

                    actualizarLabelCantidadFavoritos(0);
                }
            }
        })
        .catch(err => console.error(err));

    });

    contenedor.appendChild(tarjeta);
});
        });
    }

});

function actualizarLabelCantidadFavoritos(total) {

    const label = document.getElementById("carrito-cantidad-label");

    if (!label) return;

    label.innerText = total === 1
        ? "1 producto"
        : `${total} productos`;
}

