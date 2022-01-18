var express = require('express');
var router = express.Router();
const fs = require("fs")

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jaime:jaime@series.p5syw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

const serieSchema = {
    id: Number, 
    rank: Number, 
    title: String, 
    yearOfRelease: String, 
    rating: String, 
    posterURL: String, 
    tvSeriesURL: String 
}

const Series = mongoose.model('Serie', serieSchema);

const listaSchema = {
    idUsuario: String,
    lista: [Number]
}

const Lista = mongoose.model('Lista', listaSchema);

router.get('/', async (req, res) => {
    try{
        const usuarios = await Lista.find({ $eq: "usuario1"})

        let anadidas = []

        if (usuarios.length === 1){
            anadidas = usuarios[0].lista
        }

        if(req.query.miLista) {
            try{
                const misSeries = await Series.find({ rank: {$in: anadidas}})
                res.render("index", {
                    listaseries: misSeries,
                    anadidas: new Set(anadidas),
                })
            }catch(e){
                console.error(e)
                return res.status(400).json({})
            }
        }else{
            Series.find({}, function(err, series) {
                res.render('index', {
                    listaseries: series,
                    anadidas: new Set(anadidas)
                })
            })
        }

    }catch(e){
        console.error(e)
        res.render('index', {
            listaseries: [],
        }) 
    }

});

router.post('/anadir', async (req, res) => {
    const {id} = req.body
        if(!id) {
            res.status(400).json({error: "No hay id"})
            return;
        }
    Lista.find({ $eq: "usuario1"}, function(err, listas) {
        if(err) {
            console.error(err)
            return res.status(400).json({})
        }
        if(listas.length==0){
            const doc = new Lista({idUsuario: "usuario1", lista: [id]})
            doc.save()
        } else{
            const usuario = listas[0]
            usuario.lista.addToSet(id)
            usuario.save()
        }
        res.status(200).json({})
        })
      
});

router.post('/eliminar', async (req, res) => {
    const {id} = req.body
        if(!id) {
            res.status(400).json({error: "No hay id"})
            return;
        }
    Lista.find({ $eq: "usuario1"}, function(err, listas) {
        if(err) {
            console.error(err)
            return res.status(400).json({})
        }
        if(listas.length==0){
            const doc = new Lista({idUsuario: "usuario1", lista: [id]})
            doc.save()
        } else{
            const usuario = listas[0]
            usuario.lista.pull(id)
            usuario.save()
        }
        res.status(200).json({})
        })
});


router.put('/populate', async function(req, res, next) {

    const path = require('path');

    let rawdata = fs.readFileSync(path.resolve(__dirname, 'seriestop.json'));
    const series = JSON.parse(rawdata)

    for (const serie of series.series){
        const documento = new Series({id: serie.rank, ...serie})
        try{
            await documento.save()
        }catch(e){
            console.error(e)
        }
    }

        return res.status(200).json({})
    
});



module.exports = router;
