'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const app = express();
app.use(express.json());
app.use(morgan('common'));

//routers
const {router: eventRouter} = require('./events/router');
//CORS
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS'){
        return res(204);
    }
    next();
})

//endpoints
app.use('/api/events', eventRouter);
app.use('/', express.static('public'));
app.use('*', (req, res) =>{
    return res.status(404).json({message: `Not found`});
})

//set up server
let server;

function runServer(databaseUrl, port=PORT){
    return new Promise((resolve, reject) => {
        mongoose.connect((databaseUrl, err => {
            if (err){
                reject(err);
            }
            server = app.listen(port, ()=>{
                console.log(`Your app is listening on port ${port}`);
                resolve();
            }).on('error', err =>{
                mongoose.disconnect();
                reject(err);
            });
        }));
    });
}

function closeServer(){
    mongoose.disconnect().then(()=>{
        return new Promise ((resolve, reject)=>{
            console.log(`closing server`);
            server.close(err=>{
                if(err){
                    reject(err)
                }
                resolve();
            });
        });
    });
}

if (require.main === module){
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};