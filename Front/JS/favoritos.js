document.addEventListener("DOMContentLoaded", () => {

    //Trae del DOM el contenedor de tarjetas, el selector de categoria y el cartel de vacio
    const contenedor = document.querySelector("#lista-carrito");
    const selectCategoria = document.querySelector(".categorias-ropa");
    const carritoVacio = document.getElementById("carrito-vacio");

    //Trae el id del usuario y el token guardados en el localStorage
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    //Array que almacena los productos favoritos para poder filtrarlos despues
    let productosFavoritos = [];

    // ================= VALIDAR SESION =================
    //Si no hay sesion activa muestra el cartel de vacio y corta la ejecucion
    if (!idUsuario || !token) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    //Actualiza el label de cantidad a 0
    actualizarLabelCantidadFavoritos(0);

    return;
}

    // ================= OBTENER FAVORITOS =================
    //Consulta la API para traer los favoritos del usuario logueado
    fetch(`http://localhost:4000/api/obtenerFavoritos/${idUsuario}`, {
        headers: {
            "Authorization": token
        }
    })

    .then(response => response.json())

    .then(data => {

        //Limpia el array de favoritos antes de cargarlo nuevamente
        productosFavoritos = [];

        // ================= SIN FAVORITOS =================
        //Si la respuesta no es correcta o no hay favoritos muestra el cartel de vacio
        if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    actualizarLabelCantidadFavoritos(0);

    return;
}

        // ================= CON FAVORITOS =================
        //Limpia el contenedor y oculta el cartel de vacio antes de renderizar las tarjetas
        contenedor.innerHTML = "";
carritoVacio.style.display = "none";

//Actualiza el label con la cantidad total de favoritos
actualizarLabelCantidadFavoritos(data.payload.length);

        //Recorre cada favorito y consulta la API para obtener los datos completos del producto
        data.payload.forEach(fav => {

            fetch(`http://localhost:4000/api/obtenerDatosProducto/${fav.idProducto}`)

            .then(res => res.json())

            .then(prodData => {

                //Si la respuesta es correcta y trae datos renderiza la tarjeta del producto
                if (prodData.codigo === 200 && prodData.payload.length > 0) {

                    //Toma el primer resultado como datos del producto
                    const prod = prodData.payload[0];

                    //Agrega el producto al array de favoritos combinando sus datos con el id del favorito
                    productosFavoritos.push({
                        ...prod,
                        idProducto: fav.idProducto
                    });

                    //Crea el elemento de la tarjeta del producto
                    const tarjeta = document.createElement("div");
                    tarjeta.className = "card-producto";

                    //Rellena la tarjeta con la imagen, nombre, precio y boton de detalle del producto
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
                    //Al hacer click en el boton de eliminar envia la peticion a la API para borrar el favorito
                    tarjeta.querySelector(".btn-quitar-fav")
                    .addEventListener("click", (e) => {

                        //Obtiene el id del producto a eliminar del atributo data-id del boton
                        const idEliminar = e.currentTarget.getAttribute("data-id");

                        //Envia la peticion DELETE a la API con el id del usuario y el producto
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

                            //Si la respuesta es correcta elimina la tarjeta del DOM y actualiza el array
                            if (dataDelete.codigo === 200) {

                                //Elimina la tarjeta del DOM
                                tarjeta.remove();

                                //Filtra el array de favoritos quitando el producto eliminado
                                productosFavoritos = productosFavoritos.filter(
    p => p.idProducto != idEliminar
);

//Actualiza el label con la nueva cantidad de favoritos
actualizarLabelCantidadFavoritos(productosFavoritos.length);

                                // ================= SI NO QUEDAN FAVORITOS =================
                                //Si ya no hay tarjetas en el contenedor muestra el cartel de vacio
                                if (contenedor.children.length === 0) {

    contenedor.innerHTML = "";
    carritoVacio.style.display = "flex";

    actualizarLabelCantidadFavoritos(0);
}
                            }
                        })
                        .catch(err => console.error(err));
                    });

                    //Agrega la tarjeta al contenedor
                    contenedor.appendChild(tarjeta);
                }

            })

            .catch(err => console.error(err));
        });

    })

    .catch(error => {

        console.error(error);

        //Si hay un error de red muestra el cartel de vacio
        contenedor.innerHTML = "";
        carritoVacio.style.display = "flex";
    });

    // ================= FILTRO =================
    //Si existe el selector de categoria agrega el evento de filtrado
    if (selectCategoria) {

        //Al cambiar la categoria filtra los favoritos segun el valor seleccionado
        selectCategoria.addEventListener("change", (e) => {

            const categoria = e.target.value;

            //Limpia el contenedor antes de renderizar los productos filtrados
            contenedor.innerHTML = "";

            //Si la categoria es "productos" o vacio muestra todos, si no filtra por la categoria elegida
            const filtrados = categoria === "productos" || categoria === ""
                ? productosFavoritos
                : productosFavoritos.filter(p =>
                    (p.categoria || "").toLowerCase() === categoria.toLowerCase()
                );

            //Recorre los productos filtrados y crea una tarjeta por cada uno
            filtrados.forEach(prod => {

    //Crea el elemento de la tarjeta del producto
    const tarjeta = document.createElement("div");
    tarjeta.className = "card-producto";

    //Rellena la tarjeta con los datos del producto
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

    //Al hacer click en el boton de eliminar envia la peticion para borrar el favorito
    tarjeta.querySelector(".btn-quitar-fav")
    .addEventListener("click", (e) => {

        //Obtiene el id del producto a eliminar del atributo data-id del boton
        const idEliminar = e.currentTarget.getAttribute("data-id");

        //Envia la peticion DELETE a la API con el id del usuario y el producto
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

            //Si la respuesta es correcta elimina la tarjeta del DOM y actualiza el array
            if (dataDelete.codigo === 200) {

                //Elimina la tarjeta del DOM
                tarjeta.remove();

                //Filtra el array de favoritos quitando el producto eliminado
                productosFavoritos = productosFavoritos.filter(
                    p => p.idProducto != idEliminar
                );

                //Actualiza el label con la nueva cantidad de favoritos
                actualizarLabelCantidadFavoritos(productosFavoritos.length);

                //Si ya no hay tarjetas en el contenedor muestra el cartel de vacio
                if (contenedor.children.length === 0) {

                    contenedor.innerHTML = "";
                    carritoVacio.style.display = "flex";

                    actualizarLabelCantidadFavoritos(0);
                }
            }
        })
        .catch(err => console.error(err));

    });

    //Agrega la tarjeta al contenedor
    contenedor.appendChild(tarjeta);
});
        });
    }

});

//Actualiza el texto del label de cantidad de favoritos en el header
function actualizarLabelCantidadFavoritos(total) {

    //Trae el elemento label del DOM
    const label = document.getElementById("carrito-cantidad-label");

    //Corta la ejecucion si el elemento no existe
    if (!label) return;

    //Muestra "1 producto" o "X productos" segun la cantidad
    label.innerText = total === 1
        ? "1 producto"
        : `${total} productos`;
}
