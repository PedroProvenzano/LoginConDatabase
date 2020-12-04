const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');

// SOLO PARA DEV RECIBIR LISTA DE USUARIOS DESPUES REMOVER
router.get('/', async (req, res) => {
    try{
        const Users = await User.find();
        res.json(Users);
    }
    catch(err){
        res.json({ msg: err });
    }
});

// Crear Usuario
router.post('/', async (req, res) => {
    try {
        // Buscar usuarios en la base de datos
        const userCheck = await User.find({ username: req.body.username }).exec();
        
        // Place holder para que pueda comparar
        if(!userCheck[0]){
            userCheck[0] = [{ username: "boop boop", password: "baap baap"}];
        }

        // Chequea si el usuario ya existe
        if (req.body.username == userCheck[0].username){
            res.json({ msg: `Usuario ${req.body.username} ya existe`, sts: false });
            return
        }

        // Encriptado del pass
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ 
            username: req.body.username, password: hashedPassword 
        });

        // Enviar nuevo usuario a la base de datos
        user.save()
        .then(data => {
            res.status(200).json({ msg: `Exito creando usuario ${req.body.username}`, sts: true });
        })
        .catch(err => {
            res.json({ message: err })
        });
    } catch(err) {
        res.status(500).json({ msg: err, sts: false });
        console.log(err)
    }
});

// Login
router.post('/login', async (req, res) => {
    try{
    const users = await User.find({ username: req.body.username }).exec();
    if(!users[0]){
        return res.status(400).json( { msg:"No se encontró usuario", sts: false } );
    }
        if(await bcrypt.compare(req.body.password, users[0].password)){
        
          res.json( { msg:"Login exitoso", sts: true } );      
        }else {
            res.json( { msg:"Contraseña incorrecta", sts: false } );
        };
    } catch (err){
        res.status(500).json( { msg: err, sts: false } );
    }
})

module.exports = router;