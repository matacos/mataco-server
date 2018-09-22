const PromiseRouter = require('express-promise-router')
const fs=require("fs")
const subjectsQuery=fs.readFileSync(__dirname+"/subjectsQuery.sql").toString()

function mountRoutes(app,db,schemaValidation){
    

    let promiseRouter=PromiseRouter()


    const materiasQuery={
        properties:{
            "carrera":{type:"string"}
        },
        required:["carrera"]
    }
    promiseRouter.get('/materias',schemaValidation({query:materiasQuery}),async function (req, res,next) {
        const resultado = await db.query(subjectsQuery,[req.query.carrera])
        res.json({"subjects":resultado.rows})
        //
        //res.json(resultado.rows)
        next()
    });



    app.use(promiseRouter)

}


module.exports={
    mountRoutes:mountRoutes
}