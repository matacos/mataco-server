const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const endpoints = ["/inscripciones_cursos","/cursadas"]

    const inscripcionesCursosQuery={anyOf:[{
        required:["estudiante"]
    },{
        required:["curso"]
    },{
        const:{"aceptadas":"true"}
    },{
        const:{"aceptadas":"false"}
    },{
        const:{"con_nota":"true"}
    },{
        const:{"con_nota":"false"}
    }]}
    app.get(endpoints, schemaValidation({query:inscripcionesCursosQuery}),async function(req,res,next){
        await db.query(subjectsView)
        await db.query(coursesView)
        await db.query(studentsWithDegreesView)
        let gradedFilter=""
        if("con_nota" in req.query){
            gradedFilter="and e.grade > 0"
        }else{
            gradedFilter="and e.grade <= 0"
        }
        const query=`
        select 
            e.creation, 
            e.accepted, 
            e.grade, 
            e.grade_date,
            row_to_json(c) as course,
            row_to_json(s) as student
        from 
            course_enrollments as e, 
            courses_with_data as c,
            students_with_degrees as s
        where
            c.course=e.course
        and e.student=s.username
        and e.student like $1
        and cast(e.accepted as text) like $2
        and cast(c.course as text) like $3
        ${gradedFilter}
        ;`
        const result=await db.query(query,[
            req.query["estudiante"] || "%",
            req.query["aceptadas"] || "%",
            req.query["curso"] || "%",
        ])
        res.json({"courseInscriptions":result.rows})
        next()
    })
    const courseEnrolmentBody={
        requires:["student","course"],
        properties:{
            "student":{type:"string"},
            "course":{type:"string"},
        }
    }
    app.post(endpoints,schemaValidation({body:courseEnrolmentBody}),async function(req,res,next){
        const query=`
        insert into course_enrollments(
            course,
            student,
            creation,
            accepted,
            grade,
            grade_date
        ) values (
            $1,
            $2,
            cast( $3 as timestamp),
            'f',
            -1,
            cast( $3 as date)
        );
        `
        await db.query(query,[
            req.body.course,
            req.body.student,
            (new Date()).toISOString(),
        ])

        const retQuery=`
        select 
            e.creation, 
            e.accepted, 
            e.grade, 
            e.grade_date,
            row_to_json(c) as course,
            row_to_json(s) as student
        from 
            course_enrollments as e, 
            courses_with_data as c,
            students_with_degrees as s
        where
            c.course=e.course
        and e.student=s.username
        and c.course=$1
        and e.student=$2
        ;`
        const resultGet=db.query(retQuery,[
            req.body.course,
            req.body.student
        ])

        res.status(201).json({"courseInscriptions":resultGet.rows})
        next()
    })
    app.delete(["/inscripciones_cursos/:id","/cursadas/:id"], async function(req,res,next){
        let parts = req.params.id.split("-")
        let course=parts[0]
        let student=parts[1]
        const query=`
        delete from course_enrollments where
            course = $1
        and student= $2;
        `
        await db.query(query,[
            course,student
        ])
        res.sendStatus(204)
    })
}

module.exports={
    mountRoutes:mountRoutes
}