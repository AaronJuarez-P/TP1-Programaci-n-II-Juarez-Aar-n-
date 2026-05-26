const form = document.getElementById("formRegistro");

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

        alert("Usuario registrado correctamente");

    } catch(error) {

        console.error(error);

        alert("Error al registrar usuario");

    }
});