document.addEventListener("DOMContentLoaded", () => {
    //Trae el id del usuario y el token guardados en el localStorage
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    //Trae del DOM el formulario de perfil y el boton de volver
    const form = document.getElementById("formPerfil");
    const btnVolver = document.getElementById("boton-volver-perfil");

    //Trae del DOM los inputs del formulario de perfil
    const inputEmail = document.getElementById("email");
    const inputNombre = document.getElementById("nombre-input");
    const inputApellido = document.getElementById("apellido-input");
    const inputTelefono = document.getElementById("telefono-input");
    const inputDireccion = document.getElementById("direccion-input");

    //Variable que almacena los datos actuales del usuario para reenviarlos al modificar
    let usuarioActual = null;

    // ================= VALIDAR SESION =================
    //Si no hay sesion activa redirige al inicio
    if (!idUsuario || !token) {
        window.location.href = "inicio.html";
        return;
    }

    //Al hacer click en el boton de volver redirige al main
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "main.html";
        });
    }

    // ================= OBTENER DATOS DEL USUARIO =================
    //Consulta la API para traer los datos del usuario logueado
    fetch(`http://localhost:4000/api/obtenerDatosUsuario/${idUsuario}`, {
        headers: {
            "Authorization": token
        }
    })
        .then(response => response.json())
        .then(data => {
            //Si la respuesta no es correcta o no hay datos muestra un anuncio de error
            if (data.codigo !== 200 || !data.payload || data.payload.length === 0) {
                mostrarAnuncio("No se pudieron cargar tus datos", "fa-circle-exclamation");
                return;
            }

            //Guarda los datos del usuario en la variable global
            usuarioActual = data.payload[0];

            //Rellena los inputs del formulario con los datos del usuario
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
    //Al enviar el formulario espera la respuesta de la promesa
    form.addEventListener("submit", async (e) => {
        //Detiene el funcionamiento predeterminado del evento submit
        e.preventDefault();

        //Si el usuario todavia no cargo corta la ejecucion con un anuncio
        if (!usuarioActual) {
            mostrarAnuncio("Todava se estn cargando tus datos", "fa-circle-exclamation");
            return;
        }

        //Arma el objeto con los datos actualizados del formulario
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

        //Intenta ejecutar el codigo de actualizacion
        try {
            //Envia la peticion POST a la API con los datos actualizados
            const response = await fetch(`http://localhost:4000/api/modificarUsuario/${idUsuario}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(datosActualizados)
            });

            //Variable que espera por la respuesta del fetch y la convierte a JSON
            const data = await response.json();

            //Si la respuesta es correcta actualiza el objeto local y muestra un anuncio de exito
            if (data.codigo === 200) {
                //Fusiona los datos actualizados con el objeto local para mantenerlo sincronizado
                usuarioActual = { ...usuarioActual, ...datosActualizados };
                mostrarAnuncio("Datos actualizados correctamente", "fa-circle-check");
            } else {
                //Si no se cumple muestra el mensaje de error de la API o uno generico
                mostrarAnuncio(data.mensaje || "No se pudieron guardar los cambios", "fa-circle-exclamation");
            }
        //Se "atrapa" el error e imprime mensajes de error
        } catch (error) {
            console.error("Error al guardar:", error);
            mostrarAnuncio("Error al conectar con el servidor", "fa-circle-exclamation");
        }
    });
});

// -----------------------------------------------
// NOTIFICACIONES VISUALES
// -----------------------------------------------
//Muestra un cartel de notificacion con un mensaje e icono que desaparece automaticamente
function mostrarAnuncio(mensaje, iconoClase = "fa-circle-check") {
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
    setTimeout(() => anuncio.classList.add("mostrar"), 50);

    //Quita la clase "mostrar" y elimina el elemento del DOM luego de 3 segundos
    setTimeout(() => {
        anuncio.classList.remove("mostrar");
        setTimeout(() => anuncio.remove(), 350);
    }, 3000);
}
