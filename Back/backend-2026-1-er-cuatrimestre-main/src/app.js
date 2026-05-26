import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path"; // <-- 1. IMPORTA EL MÓDULO PATH AQUÍ

import usuarioRoutes from "./routes/usuario.routes";
import loginRoutes from "./routes/login.routes";
import productoRoutes from "./routes/producto.routes";

const app = express();

app.set("port", 4000);

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use(express.static(path.resolve("Front")));

// Routes
app.use("/api", usuarioRoutes);
app.use("/api", loginRoutes);
app.use("/api", productoRoutes);

export default app;