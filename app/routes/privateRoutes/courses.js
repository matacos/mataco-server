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
        
        let filterProfessors= ("profesor" in req.query)

        const viewCreation = await db.query(coursesView)
        const query=`
        with
            my_enrolments as (
                select course from course_enrollments where student like $3
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
                    ${filterProfessors?"professors_roles as pr,":""}
                    
                    enroled as er
                where
                    c.department_code like $1
                and c.subject_code like $2
                ${filterProfessors?"and c.id=pr.course":""}
                ${filterProfessors?"and pr.professor::text like $4":""}
                and er.id=c.id
            )
        select
            cd.department_code,
            cd.subject_code,
            cd.subject_name,
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
        const queryValues=[
            department_code || '%',
            subject_code || '%',
            student,
        ]
        if(filterProfessors){
            queryValues.push(req.query.profesor || '%')
        }
        const result = await db.query(query,queryValues)
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
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("SOY EL POST DE CURSOS :D")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log(req.body)
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")

        const viewCreation = await db.query(coursesView)

        const cod_departamento = req.body.cod_departamento
        const cod_materia = req.body.cod_materia
        const nombre = req.body.nombre
        const vacantes_totales = req.body.vacantes_totales

        const query=`
        insert into courses values
        ($1,$2,'1c2018',$3,$4);
        `
        const result = await db.query(query,[cod_departamento,cod_materia,nombre,vacantes_totales])
        const result_waiter=await db.query("select * from courses;")
        

        res.status(201).json({"insert":"OK", "result":result.rows})

        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("SOY EL POST DE CURSOS :D")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log(req.body)
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$")

        
        next()

        
    })

    const cursosQueryPut={
        requires:["cod_departamento","cod_materia","name","vacantes_totales"],
        properties:{
            "cod_departamento":{type:"string"},
            "cod_materia":{type:"string"},
            "nombre":{type:"string"},
            "vacantes_totales":{type:"number"},
        }
    }

    app.put(["/cursos/:id"], schemaValidation({body:cursosQueryPut}),async function(req,res,next){
        const viewCreation = await db.query(coursesView)

        const cod_departamento = req.body.cod_departamento
        const cod_materia = req.body.cod_materia
        const nombre = req.body.nombre
        const vacantes_totales = req.body.vacantes_totales

        let parts = req.params.id.split("-")
        let course=parts[0]

        const query=`
        update courses
        set cod_departamento = $1
            cod_materia = $2
            nombre = $3
            vacantes_totales = $4
        where
            course = $5;
        `
        const result = await db.query(query,[
            cod_departamento,cod_materia,nombre,vacantes_totales,course
        ])
        const result_waiter=await db.query("select * from courses;")
        res.sendStatus(204)
    })

    app.delete(["/cursos/:id"], async function(req,res,next){
        const viewCreation = await db.query(coursesView)

        let course = req.params.id
        const query=`
        delete from courses c where
            c.id = $1;
        `
        const result = await db.query(query,[course])
        const result_waiter=await db.query("select * from courses;")
        res.sendStatus(204)
    })


    const docenteQueryGet={
        properties:{
            "username":{type:"string"}
        },
        required:["username"]
    }
    app.get("/docente",schemaValidation({query:docenteQueryGet}), async function (req,res,next) {
        
        const query=`
        select u.username, u.name, u.surname
        from professors as p, users as u
        where p.username = u.username
        and p.username = $1
        ;
        `
        const result = await db.query(query,[req.query["username"]])
        res.json({"professor":result.rows[0]})
        next()
    })

    const docentesQueryGet={
        properties:{
        },
        required:[]
    }
    app.get("/docentes",schemaValidation({query:docentesQueryGet}), async function (req,res,next) {
            
        const query=`
        select u.username, u.name, u.surname
        from professors as p, users as u
        where p.username = u.username
        ;
        `
        const result = await db.query(query)
        res.json({"professors":result.rows})
        next()
    })


    app.delete("/cursos/:id_curso/horarios/:id_horario",async function(req,res,next){
        let query = `
        delete from classroom_uses
        where id=$1;
        `
        await db.query(query,[req.params.id_horario])
        res.sendStatus(204)
    })
    const hourBodySchema={
        required:[
            "classroomCode",
            "classroomCampus",
            "beginningHour",
            "beginningMinutes",
            "endingHour",
            "endingMinutes",
            "dayOfWeek",
            "description"
        ],
        properties:{
            "beginningHour":{type:"number"},
            "beginningMinutes":{type:"number"},
            "endingHour":{type:"number"},
            "endingMinutes":{type:"number"},
            "dayOfWeek":{enum:["lun","mar","mie","jue","vie","sab"]},
            "description":{type:"string"}
        }
    }

    app.post("/cursos/:id/horarios",schemaValidation({body:hourBodySchema}),async function (req,res,next){
        const query=`
        insert into classroom_uses(
            course,

            classroom_code,
            classroom_campus,

            beginning,
            ending,

            day_of_week,
            
            description
        ) values (
            $1,

            $2,
            $3,

            $4,
            $5,

            $6,

            $7
        );
        `
        let {
            classroomCode,
            classroomCampus,
            beginningHour,
            beginningMinutes,
            endingHour,
            endingMinutes,
            dayOfWeek,
            description
        } = req.body
        data =[
            req.params.id,

            classroomCode,
            classroomCampus,

            `${beginningHour}:${beginningMinutes}`,
            `${endingHour}:${endingMinutes}`,

            dayOfWeek,

            description
        ]
        await db.query(query,data)
        res.sendStatus(201)
        next()
    })

    const cursosAddProfessorQueryPost={
        requires:["username","rol"]
    }

    app.post("/cursos/:id/docentes",schemaValidation({body:cursosAddProfessorQueryPost}), async function (req,res,next) {
        const viewCreation = await db.query(coursesView)

        const username = req.body.username
        const id = req.params.id
        const rol = req.body.rol

        const query=`
        insert into professors_roles values
        ($1,$2,$3);
        `
        const result = await db.query(query,[username,id,rol])
        const result_waiter=await db.query("select * from professors_roles;")
        

        res.status(201).json({"insert":"OK", "result":result.rows})
        next()
    })


    app.delete(["/cursos/:id_course/docentes/:id_docente"], async function(req,res,next){
        let course=req.params.id_course
        let professor=req.params.id_docente
        const query=`
        delete from professors_roles where
            course = $1
        and professor= $2;
        `
        await db.query(query,[
            course,professor
        ])
        res.sendStatus(204)
    })

}

module.exports={
    mountRoutes:mountRoutes
}