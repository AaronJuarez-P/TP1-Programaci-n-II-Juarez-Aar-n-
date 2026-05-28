import { getConnection } from "./../database/database.js";
import jwt from "jsonwebtoken";

const secret = process.env.SECRET;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await getConnection();
        const respuesta = await connection.query("SELECT id_usuario, nombre, apellido, rol FROM usuario WHERE email = ? AND password = ?", [email, password]);
        
        if (respuesta.length > 0) {
            const usuarioLogueado = respuesta[0];
            const token = jwt.sign({
                sub: usuarioLogueado.id_usuario,
                name: usuarioLogueado.nombre,
                exp: Date.now() + 60 * 30000
            }, secret);

            res.json({ codigo: 200, mensaje: "OK", payload: respuesta, jwt: token });
        } else {
            res.json({ codigo: -1, mensaje: "Usuario o contraseña incorrecta", payload: respuesta });
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

export const methods = {
    login,
};