require("./connection");
require('dotenv/config');
const express = require('express');
const app = express();
const port = process.env.PORT;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Rutas importadas
const usersRoute = require("./routes/users");
const connection = require("./connection");
app.use("/users", usersRoute);

app.get('/', (req, res) => {
    res.json("Hola");
});

// Conexion con la base de datos
connection();

app.listen(port, () => {
 console.log(`Servidor funcionando en puerto ${process.env.PORT}`);
});