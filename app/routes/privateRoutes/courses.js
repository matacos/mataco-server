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
            my_enrolments as (
                select course from course_enrollments where student like $4
            ),
            course_ids as (
                select id from courses
            ),
            enroled as (
                select id, coalesce(course,0) > 0 as enroled
                from
                    course_ids as cids
                        left outer join my_enrolments as me on (
                            cids.id = me.course
                        )
            ),
            selected_courses as (
                select distinct
                    c.department_code, 
                    c.subject_code,
                    c.id,
                    er.enroled as enroled
                from 
                    courses as c,
                    professors_roles as pr,
                    enroled as er
                where
                    c.department_code like $1
                and c.subject_code like $2
                and c.id=pr.course
                and pr.professor::text like $3
                and er.id=c.id
            )
        select
            cd.department_code,
            cd.subject_code,
            cd.course,
            cd.name,
            cd.total_slots,
            cd.professors,
            cd.time_slots,
            cd.semester,
            sc.enroled,
            cd.occupied_slots,
            cd.free_slots
        from 
            courses_with_data as cd,
            selected_courses as sc
        where
            cd.course = sc.id
        ;
        `
        let student = "%"
        if(req.user.roles.includes("students")){
            student = req.user["username"]
        }
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]
        const result=await db.query(query,[
            department_code || '%',
            subject_code || '%',
            req.query.profesor || '%',
            student
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
        await db.query(query,  [cod_departamento, cod_materia, nombre,vacantes_totales])

        res.status(201).json({"insert":"OK"})
        next()
    })

    app.delete(["/cursos/:id"], async function(req,res,next){
        let parts = req.params.id.split("-")
        let course=parts[0]
        const query=`
        delete from courses c where
            c.id = $1;
        `
        await db.query(query,[
            course
        ])
        res.sendStatus(204)
    })

}


module.exports={
    mountRoutes:mountRoutes
}