const formInicio = document.getElementById("formInicio");
const btnRegistroInicio = document.getElementById("btn-registro-inicio");

formInicio.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.querySelector('input[name="correo"]').value;
    const password = document.querySelector('input[name="contraseña"]').value;

    const usuario = { email, password };

    try {
        const response = await fetch("http://localhost:4000/api/login", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.codigo === 200) {
            console.log("Ingreso exitoso. Se encontró el usuario.");
            localStorage.setItem("token", data.jwt);
            
            alert("Bienvenido/a");
            
            // Redirección directa usando solo el nombre del archivo
            window.location.href = "main.html";
        } else {
            console.log("Usuario no encontrado");
            alert("Usuario no registrado");
        }

    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Error al conectar con el servidor");
    }
});

// Botón para ir a Registrarse desde la pantalla de Login
btnRegistroInicio.addEventListener("click", () => {
    window.location.href = "registro.html";
});