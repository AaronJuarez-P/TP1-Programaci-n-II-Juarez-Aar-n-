//Trae del DOM el formulario de registro y el boton para ir al inicio
const form = document.getElementById("formRegistro");
const btnInicioRegistro = document.getElementById("btnInicioRegistro");

//Al enviar el formulario espera la respuesta de la promesa
form.addEventListener("submit", async (e) => {
    //Detiene el funcionamiento predeterminado del evento submit
    e.preventDefault();

    //Trae del DOM los valores ingresados en cada campo del formulario
    const nombre = document.querySelector('input[name="nombre"]').value;
    const apellido = document.querySelector('input[name="apellido"]').value;
    const direccion = document.querySelector('input[name="direccion"]').value;
    const telefono = document.querySelector('input[name="telefono"]').value;
    const email = document.querySelector('input[name="correo"]').value;
    const password = document.querySelector('input[name="contraseña"]').value;

    //Crea el objeto usuario con todos los campos del formulario y el rol por defecto
    const usuario = {
        nombre,
        apellido,
        direccion,
        telefono,
        email,
        password,
        rol: "cliente"
    };

    //Intenta ejecutar el codigo del registro
    try {
        //Variable response que espera por una consulta HTTP de metodo POST
        const response = await fetch("http://localhost:4000/api/registrarUsuario", {
            method: "POST",
            //Los datos son enviados en formato JSON
            headers: {
                "Content-Type": "application/json"
            },
            //Convierte el objeto usuario a texto
            body: JSON.stringify(usuario)
        });

        //Variable que espera por la respuesta del fetch y la convierte a JSON
        const data = await response.json();
        console.log(data);

        //Si la respuesta es correcta muestra un mensaje de exito y redirige al main
        if (data.codigo === 200) {
            alert("Usuario registrado correctamente");
            // Redirección directa usando solo el nombre del archivo
            window.location.href = "main.html"; 
        } else {
            //Si no se cumple muestra un mensaje indicando que el usuario ya esta registrado
            alert("Este usuario ya esta registrado");
        }

    //Se "atrapa" el error e imprime mensajes de error
    } catch (error) {
        console.error(error);
        alert("Error al registrar usuario");
    }
});

//Al hacer click en el boton de inicio redirige a la pagina de inicio de sesion
btnInicioRegistro.addEventListener("click", () => {
    window.location.href = "inicio.html";
});

// =====================================================
// MOSTRAR/OCULTAR CONTRASENA
// =====================================================
//Trae todos los botones de los contenedores de contraseña y agrega el evento de mostrar/ocultar
document.querySelectorAll(".password-container button").forEach((boton) => {
    boton.addEventListener("click", (e) => {
        //Detiene el funcionamiento predeterminado del evento para no enviar el formulario
        e.preventDefault();

        //Variable que busca el elemento mas cercano que cumpla con el selector
        const contenedor = boton.closest(".password-container");
        //Variable que trae el primer elemento input dentro del contenedor
        const input = contenedor.querySelector("input");
        //Variable que trae el icono del boton
        const icono = boton.querySelector("i");

        //Variable que verifica si el tipo del input es "password"
        const esPassword = input.getAttribute("type") === "password";
        //Cambia el atributo "type" del input de contraseña a texto y viceversa
        input.setAttribute("type", esPassword ? "text" : "password");

        //Alterna entre los iconos de ojo abierto y cerrado
        icono.classList.toggle("fa-eye");
        icono.classList.toggle("fa-eye-slash");
    });
});
