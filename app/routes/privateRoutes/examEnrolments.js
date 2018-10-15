const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const examsWithDataView=fs.readFileSync(__dirname+"/examsWithData.sql").toString()
const examEnrolmentsWithDataView=fs.readFileSync(__dirname+"/examEnrolmentsWithData.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const examEnrolmentQuery={anyOf:[{
        properties:{
            "id_examen":{type:"string"},
        },
        required:["id_examen"]
    },{
        properties:{
            "estudiante":{type:"string"},
        },
        required:["estudiante"]
    }]}
    app.get("/inscripciones_final",schemaValidation({query:examEnrolmentQuery}),async function(req,res,next){
        const viewCreation2 = await db.query(subjectsView)
        const viewCreation1 = await db.query(examsWithDataView)
        const viewCreation0 = await db.query(examEnrolmentsWithDataView)
        
        const examId = req.query["id_examen"] || "%"
        const studentUsername = req.query["estudiante"] || "%"
        const query=`
        select
            exams_with_data as exam,
            student,
            creation,
            grade,
            grade_date,
            enrolment_type
        from exam_enrolments_with_data
        where 
            cast(exam_id as text) like $1
        and cast(student_username as text) like $2
        ;
        `
        const result = await db.query(query,[
            examId,
            studentUsername
        ])
        res.json({"exam_enrolments":result.rows})
        next()
    })

}

module.exports={
    mountRoutes:mountRoutes
}