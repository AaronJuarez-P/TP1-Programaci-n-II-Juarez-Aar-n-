// =====================================================
// TEMA.JS - MANEJO DEL MODO OSCURO (PERSISTENTE)
// =====================================================

//IIFE que se ejecuta de inmediato antes del DOMContentLoaded para evitar el parpadeo de tema
(function aplicarTemaGuardado() {
    //Trae el tema guardado en el localStorage
    const temaGuardado = localStorage.getItem("tema");
    //Si el tema guardado es "oscuro" agrega la clase al elemento raiz para activarlo de inmediato
    if (temaGuardado === "oscuro") {
        document.documentElement.classList.add("modo-oscuro");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    //Trae del DOM el boton de modo oscuro
    const btnModoOscuro = document.getElementById("boton-modo-oscuro");
    //Corta la ejecucion si el boton no existe en la pagina
    if (!btnModoOscuro) return;

    //Sincroniza el icono del boton con el tema actual al cargar la pagina
    actualizarIconoModoOscuro(btnModoOscuro);

    //Al hacer click alterna el modo oscuro, lo persiste en localStorage y actualiza el icono
    btnModoOscuro.addEventListener("click", () => {
        //Alterna la clase "modo-oscuro" en el elemento raiz y guarda el resultado en una variable
        const activado = document.documentElement.classList.toggle("modo-oscuro");
        //Guarda el tema actual en localStorage segun si quedo activado o desactivado
        localStorage.setItem("tema", activado ? "oscuro" : "claro");
        //Actualiza el icono del boton para reflejar el nuevo estado
        actualizarIconoModoOscuro(btnModoOscuro);
    });
});

//Actualiza el icono del boton de modo oscuro segun el tema activo
function actualizarIconoModoOscuro(boton) {
    //Trae el icono del boton
    const icono = boton.querySelector("i");
    //Corta la ejecucion si el icono no existe
    if (!icono) return;

    //Verifica si el modo oscuro esta activo en el elemento raiz
    const estaOscuro = document.documentElement.classList.contains("modo-oscuro");

    //Quita ambas clases de icono antes de agregar la correcta para evitar conflictos
    icono.classList.remove("fa-moon", "fa-sun");
    //Muestra el sol si el modo oscuro esta activo, o la luna si esta desactivado
    icono.classList.add(estaOscuro ? "fa-sun" : "fa-moon");
}
