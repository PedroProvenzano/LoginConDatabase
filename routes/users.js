require("dotenv/config");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Dar usuarios al cliente -- Funciona
router.get('/', authToken, async (req, res) => {
    // Corregir
    try{
        let arrayUsers = [];
        const Users = await User.find();
        console.log(Users);
        for (let i = 0; i<Users.length; i++)
        {
            console.log(Users);
            let sendUser = {
                username: Users[i].username,
                pronoun: Users[i].pronoun,
                links: Users[i].links,
                description: Users[i].description
            }
            arrayUsers.push(sendUser);
        }
        console.log(arrayUsers);
        res.json(arrayUsers);
    }
    catch(err){
        res.json({ msg: err });
    }
});

// Dar usuario especifico

// Crear Usuario -- Funciona
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
            username: req.body.username, 
            password: hashedPassword,
            pronoun: req.body.pronoun 
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

// Login -- Funciona
router.post('/login', async (req, res) => {
    try {
    const user = await User.findOne({ username: req.body.username }).exec();
    if(!user){
        return res.status(400).json( { msg:"No se encontró usuario", sts: false } );
    }
        if(await bcrypt.compare(req.body.password, user.password)){
            // JsonWebToken ---------
            let userForToken = {
                username: user.username
            }
            const accessToken = generateAccessToken(userForToken);
            const refreshedAccessToken = await jwt.sign(userForToken, process.env.REFRESH_PASSWORD_JWT);
            // Enviar refreshedToken a DB
            const tokenDB = await Token.findOne({ token: refreshedAccessToken }).exec();
            const userData = await User.findOne({ username: userForToken.username }).exec();
            if(tokenDB == null)
            {
                refreshedToken = new Token ({ 
                    token: refreshedAccessToken
                });
                refreshedToken.save()
                .catch(err => console.log(err));
            }else{
                console.log("Ya existe esta refToken");
            }
            res.json( { msg:"Login exitoso", sts: true, accessToken: accessToken, refreshedAccessToken: refreshedAccessToken, description: userData.description, links: userData.links, pronoun: userData.pronoun } );      
        }else {
            res.json( { msg:"Contraseña incorrecta", sts: false } );
        };
    } catch (err){
        console.log(err);
        res.status(500).json( { msg: err, sts: false } );
    }
});

// Posts de descripcion -- Funciona menos agregar imagen
router.post('/description', authToken, async (req, res) => {
    try{  
        let user = await User.findOne({
            username: req.body.username
        });
        if(req.body.description)
        {
            user.description = req.body.description;
        }
        if(req.body.links)
        {
            user.links = req.body.links;
        }
        console.log(user);
        user.save()
        .then(data => {
            res.status(200).json({ msg: `Descripcion editada con exito` })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err, sts: false });
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: err, sts: false });
    }
})

// Token Refresher -- Funciona
router.post('/token', async (req, res) => {
    // Check si mandan algo
    try{
        const refreshToken = req.body.token
        if(refreshToken == null) return res.status(401);
        const token = await Token.findOne({ token: refreshToken }).exec();
        if(token == null) return res.status(403)
        jwt.verify(refreshToken, process.env.REFRESH_PASSWORD_JWT, (err, user) => {
            if(err) return res.status(403)
            const accessToken = generateAccessToken({ username: req.body.username });
            console.log("Giving new token to the user " + req.body.username);
            res.status(202).json({ token: accessToken });
        });
    } catch (err)
    {
        console.log(err)
        res.json({ msg: err, sts: false });
    }
});

// Logout
router.post('/logout', authToken, async (req, res) => {
    try
    {
        Token.deleteOne({ token: req.body.tokenRef }, (err) => {
            console.log(err);
        });
        res.status(200).json({ msg: "Token eliminado correctamente", sts: true });
    }
    catch(err)
    {
        res.status(404).json({ msg: "Token no disponible en base de datos", sts: false });
    }
})

// Middlewares

// Token checker -- Funciona
function authToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null)
    {
        res.status(401);
    }
    jwt.verify(token, process.env.SECRET_PASSWORD_JWT, (err, user) => {
        if(err) return res.status(403).json({ msg: 'TNV', sts: false });
        next();
    })
}

// Funciones

// Generador de tokens que expiran en 20min -- Funciona
function generateAccessToken(user)
{
    return jwt.sign(user, process.env.SECRET_PASSWORD_JWT, { expiresIn: '15s' });
}


module.exports = router;