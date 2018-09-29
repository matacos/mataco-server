const PromiseRouter = require('express-promise-router')
const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const courseEnrolments=require("./courseEnrolments.js")
const courses=require("./courses.js")
function mountRoutes(app,db,schemaValidation){
    

    let promiseRouter=PromiseRouter()


    const materiasQuery={anyOf:[{
        properties:{"carrera":{type:"string"}},
        required:["carrera"]
    },{
        properties:{"departamento":{type:"string"}},
        required:["departamento"]
    }]}
    promiseRouter.get('/materias',schemaValidation({query:materiasQuery}),async function (req, res,next) {
        const viewCreation = await db.query(subjectsView)
        let result={}
        
        const query = `
        with
        selected_subjects as (
            select
                sd.code,
                sd.department_code
            from 
                subjects as sd,
                credits as cr,
                departments as d
            where
                sd.code=cr.subject_code
            and sd.department_code = d.code
            and sd.department_code=cr.department_code
            and cr.degree like $1
            and d.name like $2
        )
        select 
            sd.name,
            sd.code,
            sd.department_code,
            sd.department,
            sd.credits,
            sd.required_credits,
            sd.required_subjects
        from
            subjects_with_data as sd,
            selected_subjects as ss
        where
            ss.code = sd.code
        and ss.department_code = sd.department_code
        ;
        `
        result=await db.query(query,[
            req.query.carrera || '%',
            req.query.departamento || '%'
        ])
        
        

        res.json({"subjects":result.rows})
        //
        //res.json(resultado.rows)
        next()
    });


    
    courseEnrolments.mountRoutes(promiseRouter,db,schemaValidation)
    courses.mountRoutes(promiseRouter,db,schemaValidation)


    app.use(promiseRouter)

}


module.exports={
    mountRoutes:mountRoutes
}