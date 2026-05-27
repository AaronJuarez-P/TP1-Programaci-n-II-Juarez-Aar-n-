import { getConnection } from "./../database/database.js"; // <-- CORREGIDO: Agregado .js al final
const secret = process.env.secret;
import jwt from "jsonwebtoken"; // <-- CORREGIDO: Cambiado require por import

const obtenerDatosUsuario = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const id = req.params.id
        const connection = await getConnection();
        const response = await connection.query("SELECT * from usuario u where u.id_usuario = ?",id);
        if(response.length == 1){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: -1, mensaje:"Usuario no encontrado", payload: []})
        }

    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

const modificarUsuario = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const { id } = req.params
        const {
            nombre,
            apellido,
            direccion,
            email,
            telefono,
            rol,
            password
        } = req.body

        const usuario = {
            nombre,
            apellido,
            direccion,
            password,
            email,
            telefono,
            rol,
        }
        const connection = await getConnection();
        const response = await connection.query("UPDATE usuario u SET ? where u.id_usuario = ?",[usuario,id]);
        if(response.affectedRows > 0){
            res.json({codigo: 200, mensaje:"OK", payload: []})
        }
        else{
            res.json({codigo: -1, mensaje:"Error modificando datos del usuario", payload: []})
        }

    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

const crearUsuario = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            direccion,
            email,
            telefono,
            rol,
            password
        } = req.body;

        const usuario = {
            nombre,
            apellido,
            direccion,
            password,
            email,
            telefono,
            rol,
        };

        const connection = await getConnection();

        // 1. Verificar si el email ya existe
        const verificarUsuario = await connection.query(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        console.log("Resultado de la búsqueda:", verificarUsuario);

        if (verificarUsuario && verificarUsuario.length > 0) {
            return res.json({
                codigo: -1,
                mensaje: "El email ya está registrado",
                payload: []
            });
        }

        // 2. Registrar usuario si el email no existía
        const response = await connection.query(
            "INSERT INTO usuario SET ?",
            usuario
        );

        if (response && response.affectedRows > 0) {
            res.json({
                codigo: 200,
                mensaje: "Usuario registrado exitosamente",
                payload: [{ id_usuario: response.insertId }]
            });
        } else {
            res.json({
                codigo: -1,
                mensaje: "Error registrando usuario en la base de datos",
                payload: []
            });
        }

    } catch (error) {
        console.error("Error en crearUsuario:", error);
        res.status(500);
        res.send(error.message);
    }
}

function verificarToken(req){
    const token = req.headers.authorization;
    if(!token){
        return {estado: false, error: "Token no proporcionado"}
    }
    try{
        const payload = jwt.verify(token, secret);
        if(Date.now() > payload.exp){
            return {estado: false, error: "Token expirado"}
        }
        return {estado: true};
    }
    catch(error){
        return {estado: false, error: "Token inválido"}
    }  
}

export const methods = {
    obtenerDatosUsuario,
    crearUsuario,
    modificarUsuario
};