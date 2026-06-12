// =====================================================
// TEMA.JS - MANEJO DEL MODO OSCURO (PERSISTENTE)
// =====================================================

(function aplicarTemaGuardado() {
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "oscuro") {
        document.documentElement.classList.add("modo-oscuro");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const btnModoOscuro = document.getElementById("boton-modo-oscuro");
    if (!btnModoOscuro) return;

    actualizarIconoModoOscuro(btnModoOscuro);

    btnModoOscuro.addEventListener("click", () => {
        const activado = document.documentElement.classList.toggle("modo-oscuro");
        localStorage.setItem("tema", activado ? "oscuro" : "claro");
        actualizarIconoModoOscuro(btnModoOscuro);
    });
});

function actualizarIconoModoOscuro(boton) {
    const icono = boton.querySelector("i");
    if (!icono) return;

    const estaOscuro = document.documentElement.classList.contains("modo-oscuro");

    icono.classList.remove("fa-moon", "fa-sun");
    icono.classList.add(estaOscuro ? "fa-sun" : "fa-moon");
}
