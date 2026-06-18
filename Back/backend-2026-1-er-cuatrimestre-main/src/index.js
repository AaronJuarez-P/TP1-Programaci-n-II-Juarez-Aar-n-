import app from "./app.js";
import jwt from "jsonwebtoken"; // Convertido a ES Module
import { methods } from "./controllers/producto.controller.js"; // Agregado .js y convertido a import

const main = () => {
    app.listen(app.get("port"), () => {
        console.log(`🚀 Servidor corriendo con éxito en el puerto ${app.get("port")}`);
    });
};

main();

// Esto ejecuta la función apenas arranca el backend para verificar que la BD responda
methods.fetchProductos()
    .then(products => {
        console.log('✅ Conexión con Base de Datos exitosa. Productos cargados:', products.length);
    })
    .catch(error => {
        console.error('❌ Error al intentar traer productos de la BD:', error);
    });