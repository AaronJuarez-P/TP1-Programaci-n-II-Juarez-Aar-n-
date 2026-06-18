//Trea del DOM el formularrio de inicio
const formInicio = document.getElementById("formInicio");
//Trae del DOM el boton de registro en el formulario de inicio
const btnRegistroInicio = document.getElementById("btn-registro-inicio");

//Al enviar el formulario se espera la respuesta de la promesa
formInicio.addEventListener("submit", async (e) => {
    //Detiene el funcionamiento predeterminado del evento submit
    e.preventDefault();
    
    //Trae del DOM los valores ingresados en el correo y contraseña
    const email = document.querySelector('input[name="correo"]').value;
    const password = document.querySelector('input[name="contraseña"]').value;

    //Crea el objeto usuario con los campos anteriores
    const usuario = { email, password };

    //Intenta ejecutar el codigo
    try {
        //Variable response que espera por una consulta HTTP de metodo POST
        const response = await fetch("http://localhost:4000/api/login", {
            method: "POST", 
            //Los datos son enviados en formato JSON
            headers: {
                "Content-Type": "application/json"
            },
            //Convierte el objeto usuario a texto
            body: JSON.stringify(usuario)
        });
        //Variable que que espera por la respuesta del fetch y convierte a JSON
        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        //Si la respuesta es correcta (200) imprime, mensaje de exito, dispara alert y codigo del JWT
        //Json Web Token
        if (data.codigo === 200) {
            console.log("Ingreso exitoso. Se encontró el usuario.");
            localStorage.setItem("token", data.jwt);
            localStorage.setItem("idUsuario", data.payload[0].id_usuario);
            
            alert("Bienvenido/a");
            
            //Al iniciar sesión se redirecciona a la pagina principal
            window.location.href = "main.html";

            //Si no se cumple imprime mensajes de error y alert
        } else {
            console.log("Usuario no encontrado");
            alert("Usuario no registrado");
        }

        //Se "atrapa" el error e imprime mensajes de error
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Error al conectar con el servidor");
    }
});

// Botón para ir a registro desde la pantalla de Login
btnRegistroInicio.addEventListener("click", () => {
    window.location.href = "registro.html";
});

//Trae todos los elementos que coinciden con los selectores
//Al clickear detiene el funcionamiento predeterminado
document.querySelectorAll(".password-container button").forEach((boton) => {
    boton.addEventListener("click", (e) => {
        e.preventDefault();

        //Variable que busca el elemento mas cercanoque cumpla con el selector
        const contenedor = boton.closest(".password-container");
        //Variable que trae el primer elemento input
        const input = contenedor.querySelector("input");
        //Variable que trae el icono
        const icono = boton.querySelector("i");

        //Variable que iguala el tipo a algun tipo valido
        const esPassword = input.getAttribute("type") === "password";
        //Cambia el atributo "type" del input de contraseña a texto y viceversa
        input.setAttribute("type", esPassword ? "text" : "password");

        //A icono se le agrega la clase del icono ojo o pestaña
        icono.classList.toggle("fa-eye");
        icono.classList.toggle("fa-eye-slash");
    });
});
