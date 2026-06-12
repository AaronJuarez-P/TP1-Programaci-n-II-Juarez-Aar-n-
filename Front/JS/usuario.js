document.addEventListener("DOMContentLoaded", () => {
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    const form = document.getElementById("formPerfil");
    const btnVolver = document.getElementById("boton-volver-perfil");

    const inputEmail = document.getElementById("email");
    const inputNombre = document.getElementById("nombre-input");
    const inputApellido = document.getElementById("apellido-input");
    const inputTelefono = document.getElementById("telefono-input");
    const inputDireccion = document.getElementById("direccion-input");

    let usuarioActual = null;

    // ================= VALIDAR SESION =================
    if (!idUsuario || !token) {
        window.location.href = "inicio.html";
        return;
    }

    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "main.html";
        });
    }

    // ================= OBTENER DATOS DEL USUARIO =================
    fetch(`http://localhost:4000/api/obtenerDatosUsuario/${idUsuario}`, {
        headers: {
            "Authorization": token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {
                mostrarAnuncio("No se pudieron cargar tus datos", "fa-circle-exclamation");
                return;
            }

            usuarioActual = data.payload[0];

            inputEmail.value = usuarioActual.email || "";
            inputNombre.value = usuarioActual.nombre || "";
            inputApellido.value = usuarioActual.apellido || "";
            inputTelefono.value = usuarioActual.telefono || "";
            inputDireccion.value = usuarioActual.direccion || "";
        })
        .catch(error => {
            console.error("Error de conexin:", error);
            mostrarAnuncio("Error al conectar con el servidor", "fa-circle-exclamation");
        });

    // ================= GUARDAR CAMBIOS =================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!usuarioActual) {
            mostrarAnuncio("Todava se estn cargando tus datos", "fa-circle-exclamation");
            return;
        }

        const datosActualizados = {
            nombre: inputNombre.value.trim(),
            apellido: inputApellido.value.trim(),
            telefono: inputTelefono.value.trim(),
            direccion: inputDireccion.value.trim(),
            // Se reenvan estos campos para no perder la informacin existente
            email: usuarioActual.email,
            password: usuarioActual.password,
            rol: usuarioActual.rol
        };

        try {
            const response = await fetch(`http://localhost:4000/api/modificarUsuario/${idUsuario}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(datosActualizados)
            });

            const data = await response.json();

            if (data.codigo === 200) {
                usuarioActual = { ...usuarioActual, ...datosActualizados };
                mostrarAnuncio("Datos actualizados correctamente", "fa-circle-check");
            } else {
                mostrarAnuncio(data.mensaje || "No se pudieron guardar los cambios", "fa-circle-exclamation");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            mostrarAnuncio("Error al conectar con el servidor", "fa-circle-exclamation");
        }
    });
});

// -----------------------------------------------
// NOTIFICACIONES VISUALES
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
