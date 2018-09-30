const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()

function mountRoutes(app,db,schemaValidation){
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
    app.get("/cursos",schemaValidation({query:cursosQuery}), async function (req,res,next) {
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

    const cursosQueryPost={
        requires:["cod_departamento","cod_materia","name","vacantes_totales"],
        properties:{
            "cod_departamento":{type:"string"},
            "cod_materia":{type:"string"},
            "nombre":{type:"string"},
            "vacantes_totales":{type:"number"},
        }
    }

    app.post("/cursos",schemaValidation({body:cursosQueryPost}), async function (req,res,next) {

        const cod_departamento = req.body.cod_departamento
        const cod_materia = req.body.cod_materia
        const nombre = req.body.nombre
        const vacantes_totales = req.body.vacantes_totales

        const query=`
        insert into courses(department_code,subject_code,semester,name,total_slots) values
        ($1,$2,'1c2018',$3,$4);
        `
        const result = await db.query(query,  [cod_departamento, cod_materia, nombre,vacantes_totales])
        res.json({"insert":"OK", "name":nombre})
        next()
    })
}


module.exports={
    mountRoutes:mountRoutes
}