const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()

function mountRoutes(app,db,schemaValidation){
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
    app.get(["/inscripciones_cursos","/cursadas"], schemaValidation({query:inscripcionesCursosQuery}),async function(req,res,next){
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
}

module.exports={
    mountRoutes:mountRoutes
}