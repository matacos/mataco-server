const PromiseRouter = require('express-promise-router')
const fs=require("fs")
const subjectsQuery=fs.readFileSync(__dirname+"/subjectsQuery.sql").toString()
const coursesQuery=fs.readFileSync(__dirname+"/coursesQuery.sql").toString()

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

    const cursosQuery={
        properties:{
            "cod_materia":{type:"string"},
            "cod_departamento":{type:"string"},
        },
        required:["cod_materia","cod_departamento"]
    }
    promiseRouter.get("/cursos",schemaValidation({query:cursosQuery}), async function (req,res,next) {
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]
        const result=await db.query(coursesQuery,[department_code,subject_code])
        res.json({"courses":result.rows})
        next()
    })



    app.use(promiseRouter)

}


module.exports={
    mountRoutes:mountRoutes
}