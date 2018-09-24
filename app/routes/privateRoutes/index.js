const PromiseRouter = require('express-promise-router')
const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()

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

    const cursosQuery={anyOf:[{
        properties:{
            "cod_materia":{type:"string"},
            "cod_departamento":{type:"string"},
        },
        required:["cod_materia","cod_departamento"]
    },{
        properties:{
            "profesor":{type:"string"}
        },
        required:["profesor"]
    }]}
    promiseRouter.get("/cursos",schemaValidation({query:cursosQuery}), async function (req,res,next) {
        const viewCreation = await db.query(coursesView)
        const query=`
        with
        selected_courses as (
            select distinct
                c.department_code, 
                c.subject_code,
                c.id
            from 
                courses as c,
                professors_roles as pr
            where
                c.department_code like $1
            and c.subject_code like $2
            and c.id=pr.course
            and pr.professor::text like $3
        )
        select
            cd.department_code,
            cd.subject_code,
            cd.course,
            cd.name,
            cd.total_slots,
            cd.professors,
            cd.time_slots
        from 
            courses_with_data as cd,
            selected_courses as sc
        where
            cd.course = sc.id
        ;
        `
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]
        const result=await db.query(query,[
            department_code || '%',
            subject_code || '%',
            req.query.profesor || '%'
        ])
        res.json({"courses":result.rows})
        next()
    })



    app.use(promiseRouter)

}


module.exports={
    mountRoutes:mountRoutes
}