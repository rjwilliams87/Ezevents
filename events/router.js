'use strict';
const express = require('express');
const router = express.Router();

const {Events} = require('../models');

router.get('/', function(req, res){
    Events
    .find()
    .then(events=>{
        res.json(events.map(event => event.serialize()));
    })
    .catch(err =>{
        console.error(err);
        res.status(500).json({error: `Internal Server Error`});
    })
});

router.get('/:id', function(req, res){
    Events.findOne({_id: req.params.id})
    .then((event)=>{
        res.status(200).json(event.fullReport());
    }).catch(err => {
        console.error(err);
        res.status(500).json({error: `Internal Server Error`});
    })
})

router.post('/', function(req, res){
    const requiredFields = ['contact', 'date', 'time', 'order'];
    for (let i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing \ ${field} \ in req body`;
            console.error(message);
            res.status(400).send(message);
        }
    }
    Events.create({
        contact: req.body.contact,
        date: req.body.date,
        time: req.body.time,
        order: req.body.order
    }).then(event => res.status(201).json(event.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: `Internal Server Error`})
    });
});

router.put('/:id', function(req, res){
    if (!(req.params.id && req.body.id & req.params.id === req.body.id)){
        res.status(400).json({
            error: `Req path id and req body id must match`
        });
    }
    const toUpdate = {};
    const updatableFields = ['contact', 'time', 'date', 'order'];
    updatableFields.forEach(field => {
        if (field in req.body){
            toUpdate[field] = req.body[field];
        }
    });

    Events
    .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
    .then((updatedEvent) => {res.status(204).end()})
    .catch((err)=>{
        console.error(err);
        res.status(500).json({error: `Internal Server Error`})
    })
});

router.delete('/:id', function(req, res){
    Events
    .findByIdAndRemove(req.params.id)
    .then(()=>{
        console.log(`Deleted event with id ${req.params.id}`);
        res.status(204).end();
    })
})

module.exports = {router};