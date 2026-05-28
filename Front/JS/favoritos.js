document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.querySelector(".contenedor-productos");
    const selectCategoria = document.querySelector(".categorias-ropa"); // 👈 SOLO AGREGADO

    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    // 👇 SOLO AGREGADO (estado local para filtrar)
    let productosFavoritos = [];

    // ================= VALIDAR SESION =================

    if (!idUsuario || !token) {

        contenedor.innerHTML = `
            <p class="sin-favoritos">
                Debes iniciar sesión para ver tus favoritos.
            </p>
        `;

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

        // ================= SIN FAVORITOS =================

        if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-favoritos">
                    No tienes productos añadidos a tus favoritos.
                </p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        // ================= RECORRER FAVORITOS =================

        data.payload.forEach(fav => {

            fetch(`http://localhost:4000/api/obtenerDatosProducto/${fav.idProducto}`)

            .then(res => res.json())

            .then(prodData => {

                if (prodData.codigo === 200 && prodData.payload.length > 0) {

                    const prod = prodData.payload[0];

                    console.log(prod);

                    // 👇 SOLO AGREGADO (guardar en array para filtrar)
                    productosFavoritos.push({
                        ...prod,
                        idProducto: fav.idProducto
                    });

                    // ================= CREAR TARJETA =================

                    const tarjeta = document.createElement("div");

                    tarjeta.className = "card-producto";

                    tarjeta.innerHTML = `

                        <img 
                            src="${prod.urlImagen || prod.ulrImagen}" 
                            alt="${prod.producto}"
                        >

                        <div class="info-producto">

                            <h4>${prod.producto}</h4>

                            <p class="precio-producto">
                                ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>

                            <a 
                                href="detalleProducto.html?id=${fav.idProducto}" 
                                class="btn-ver-producto"
                            >
                                Ver producto
                            </a>

                        </div>

                        <button 
                            type="button" 
                            class="btn-quitar-fav" 
                            data-id="${fav.idProducto}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;

                    // ================= ELIMINAR FAVORITO =================

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

                        .then(resDelete => resDelete.json())

                        .then(dataDelete => {

                            if (dataDelete.codigo === 200) {

                                tarjeta.remove();

                                // ================= SI YA NO HAY FAVORITOS =================

                                if (contenedor.children.length === 0) {

                                    contenedor.innerHTML = `
                                        <p class="sin-favoritos">
                                            No tienes productos añadidos a tus favoritos.
                                        </p>
                                    `;
                                }
                            }
                        })

                        .catch(err => console.error(err));
                    });

                    // ================= AGREGAR TARJETA =================

                    contenedor.appendChild(tarjeta);
                }

            })

            .catch(err => console.error(err));
        });

    })

    .catch(error => {

        console.error(error);

        contenedor.innerHTML = `
            <p class="sin-favoritos">
                Error al cargar los favoritos.
            </p>
        `;
    });

    // ================= FILTRO POR CATEGORIAS (NUEVO, NO ROMPE NADA) =================

    if (selectCategoria) {
        selectCategoria.addEventListener("change", (e) => {

            const categoria = e.target.value;

            contenedor.innerHTML = "";

            const filtrados = categoria === "productos" || categoria === ""
                ? productosFavoritos
                : productosFavoritos.filter(p =>
                    p.categoria?.toLowerCase() === categoria.toLowerCase()
                );

            filtrados.forEach(prod => {

                const tarjeta = document.createElement("div");
                tarjeta.className = "card-producto";

                tarjeta.innerHTML = `

                    <img 
                        src="${prod.urlImagen || prod.ulrImagen}" 
                        alt="${prod.producto}"
                    >

                    <div class="info-producto">

                        <h4>${prod.producto}</h4>

                        <p class="precio-producto">
                            ARS$ ${parseFloat(prod.precio).toLocaleString('es-AR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>

                        <a 
                            href="detalleProducto.html?id=${prod.idProducto}" 
                            class="btn-ver-producto"
                        >
                            Ver producto
                        </a>

                    </div>

                    <button 
                        type="button" 
                        class="btn-quitar-fav" 
                        data-id="${prod.idProducto}"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `;

                contenedor.appendChild(tarjeta);
            });
        });
    }

});