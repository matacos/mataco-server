const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()

function mountRoutes(app,db,schemaValidation,notify){
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
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log(req.semester)
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

        let semester=req.semester[0].code
        if("semester" in req.query) {
            if (req.query.semester=="any"){
                semester="%"
            }else{
                semester=req.query.semester
            }
        }

        console.log("==============================")
        console.log("==============================")
        console.log("==============================")
        console.log(semester)

        console.log("==============================")
        console.log("==============================")
        console.log("==============================")

        
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
                ${filterProfessors?"and pr.professor::text like $5":""}
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
        and cd.semester like $4
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
            semester
        ]
        if(filterProfessors){
            queryValues.push(req.query.profesor || '%')
        }
        const result = await db.query(query,queryValues)
        res.json({"courses":result.rows})
        next()
    })

    const cursosQueryPost={
        requires:["cod_departamento","cod_materia","name","vacantes_totales","ciclo_lectivo"],
        properties:{
            "cod_departamento":{type:"string"},
            "cod_materia":{type:"string"},
            "nombre":{type:"string"},
            "vacantes_totales":{type:"number"},
            "ciclo_lectivo":{
                type:"string",
                maxLength:10,
                minLength:1
            }
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
        const ciclo_lectivo = req.body.ciclo_lectivo

        const query=`
        insert into courses values
        ($1,$2,$5,$3,$4);
        `
        const result = await db.query(query,[cod_departamento,cod_materia,nombre,vacantes_totales,ciclo_lectivo])
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

    const cursosBodyPut={anyOf:[{
        requires:["total_slots"],
        properties:{
            "total_slots":{type:"number"},
        }
    },{
        requires:["name"],
        properties:{
            "name":{type:"number"},
        }
    }]}

    app.put(["/cursos/:id"], schemaValidation({body:cursosBodyPut}),async function(req,res,next){
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11111")
        // --------------- enviar notificación ---------------- //
        const courseData = (await db.query(`
            select s.name as subject_name, c.name as course_name
            from 
                courses c, 
                subjects s 
            where 
                c.department_code=s.department_code 
            and s.code=c.subject_code 
            and c.id=$1;
        `,[req.params.id])).rows[0]
        let nombreCurso=courseData.course_name;
        let nombreMateria=courseData.subject_name;

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11222")
        const notificationsQuery=`
            select firebase_token 
            from 
                users u, 
                course_enrollments ce 
            where 
                u.username=ce.student 
            and ce.course=$1;
        `

        const notificationsQueryResult=await db.query(notificationsQuery,[req.params.id]);
        const tokens=notificationsQueryResult.rows.map((r)=>r.firebase_token).filter((x)=>x!=null)
        const message=`
            El curso ${nombreCurso} de la materia ${nombreMateria} fue modificado. Haga click aquí para ver los cambios.
        `
        await notify.notifyAndroid(tokens,message,"courses","Curso Modificado")

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$113333")

        // ------------------ eliminar ---------------------- //

        const viewCreation = await db.query(coursesView)
        let modifications=[]
        let newValues=[]
        for( let parameter in req.body){
            modifications.push(` ${parameter}=$${modifications.length + 2 } `)
            newValues.push(req.body[parameter])
        }
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$133333")
        const query=`
        update courses
        set ${modifications.join(",")}
        where
            id = $1;
        `
        

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$1444444")
        
        
        const result = await db.query(query,[req.params.id].concat(newValues))

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$15555")
        res.sendStatus(204)

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$1666")
    })

    app.delete(["/cursos/:id"], async function(req,res,next){
        // --------------- enviar notificación ---------------- //
        const courseData = (await db.query(`
            select s.name as subject_name, c.name as course_name
            from 
                courses c, 
                subjects s 
            where 
                c.department_code=s.department_code 
            and s.code=c.subject_code 
            and c.id=$1;
        `,[req.params.id])).rows[0]
        let nombreCurso=courseData.course_name;
        let nombreMateria=courseData.subject_name;

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11222")
        const notificationsQuery=`
            select firebase_token 
            from 
                users u, 
                course_enrollments ce 
            where 
                u.username=ce.student 
            and ce.course=$1;
        `

        const notificationsQueryResult=await db.query(notificationsQuery,[req.params.id]);
        const tokens=notificationsQueryResult.rows.map((r)=>r.firebase_token).filter((x)=>x!=null)
        const message=`
            El curso ${nombreCurso} de la materia ${nombreMateria} fue cancelado.
        `
        await notify.notifyAndroid(tokens,message,"courses","Curso Cancelado")

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$113333")
        // -------------- eliminar el curso ----------------- //
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
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11111")
        // --------------- enviar notificación ---------------- //
        const courseData = (await db.query(`
            select s.name as subject_name, c.name as course_name
            from 
                courses c, 
                subjects s 
            where 
                c.department_code=s.department_code 
            and s.code=c.subject_code 
            and c.id=$1;
        `,[req.params.id_curso])).rows[0]
        let nombreCurso=courseData.course_name;
        let nombreMateria=courseData.subject_name;

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11222")
        const notificationsQuery=`
            select firebase_token 
            from 
                users u, 
                course_enrollments ce 
            where 
                u.username=ce.student 
            and ce.course=$1;
        `

        const notificationsQueryResult=await db.query(notificationsQuery,[req.params.id_curso]);
        const tokens=notificationsQueryResult.rows.map((r)=>r.firebase_token).filter((x)=>x!=null)
        const message=`
            El curso ${nombreCurso} de la materia ${nombreMateria} fue modificado. Haga click aquí para ver los cambios.
        `
        await notify.notifyAndroid(tokens,message,"courses","Curso Modificado")

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$113333")
        // -------------------------------- HACER LO DEL HOARIO -----------------------/
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
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11111")
        // --------------- enviar notificación ---------------- //
        const courseData = (await db.query(`
            select s.name as subject_name, c.name as course_name
            from 
                courses c, 
                subjects s 
            where 
                c.department_code=s.department_code 
            and s.code=c.subject_code 
            and c.id=$1;
        `,[req.params.id])).rows[0]
        let nombreCurso=courseData.course_name;
        let nombreMateria=courseData.subject_name;

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$11222")
        const notificationsQuery=`
            select firebase_token 
            from 
                users u, 
                course_enrollments ce 
            where 
                u.username=ce.student 
            and ce.course=$1;
        `

        const notificationsQueryResult=await db.query(notificationsQuery,[req.params.id]);
        const tokens=notificationsQueryResult.rows.map((r)=>r.firebase_token).filter((x)=>x!=null)
        const message=`
            El curso ${nombreCurso} de la materia ${nombreMateria} fue modificado. Haga click aquí para ver los cambios.
        `
        await notify.notifyAndroid(tokens,message,"courses","Curso Modificado")

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$113333")
        // ------------------ HACER LA MODIFICACION --------------------------- //
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