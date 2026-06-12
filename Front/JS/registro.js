const form = document.getElementById("formRegistro");
const btnInicioRegistro = document.getElementById("btnInicioRegistro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('input[name="nombre"]').value;
    const apellido = document.querySelector('input[name="apellido"]').value;
    const direccion = document.querySelector('input[name="direccion"]').value;
    const telefono = document.querySelector('input[name="telefono"]').value;
    const email = document.querySelector('input[name="correo"]').value;
    const password = document.querySelector('input[name="contraseña"]').value;

    const usuario = {
        nombre,
        apellido,
        direccion,
        telefono,
        email,
        password,
        rol: "cliente"
    };

    try {
        const response = await fetch("http://localhost:4000/api/registrarUsuario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();
        console.log(data);

        if (data.codigo === 200) {
            alert("Usuario registrado correctamente");
            // Redirección directa usando solo el nombre del archivo
            window.location.href = "main.html"; 
        } else {
            alert("Este usuario ya esta registrado");
        }

    } catch (error) {
        console.error(error);
        alert("Error al registrar usuario");
    }
});

// Botón para ir al Login desde la pantalla de registro
btnInicioRegistro.addEventListener("click", () => {
    window.location.href = "inicio.html";
});

// =====================================================
// MOSTRAR/OCULTAR CONTRASENA
// =====================================================
document.querySelectorAll(".password-container button").forEach((boton) => {
    boton.addEventListener("click", (e) => {
        e.preventDefault();

        const contenedor = boton.closest(".password-container");
        const input = contenedor.querySelector("input");
        const icono = boton.querySelector("i");

        const esPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", esPassword ? "text" : "password");

        icono.classList.toggle("fa-eye");
        icono.classList.toggle("fa-eye-slash");
    });
});
