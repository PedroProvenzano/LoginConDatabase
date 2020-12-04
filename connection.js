require('dotenv/config');
const mongoose = require('mongoose');

async function connection(){
    try{
        await mongoose.connect(process.env.CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('Connection OK!');
    }
    catch(err){
        console.log('Theres been an error:', err);
    }
};

module.exports = connection;