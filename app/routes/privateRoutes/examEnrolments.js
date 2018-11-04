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
        let since=req.now
        if("since" in req.query){
            if(isNaN(Date.parse(req.query.since))){
                since = req.query.since
            }else{
                since = new Date(req.query.since)
            }
        }
        if(since=="current"){
            since=new Date(req.semester[0].classes_ending_date)
        }
        /*
        let dateFilter=""
        if(since=="any"){
            dateFilter=""
        }else{
            dateFilter="and exams_with_data::json->'exam_date'::date >= $3::date"
        }
        if(since=="current"){
            since=new Date(req.semester[0].classes_ending_date)
            dateFilter="and (exams_with_data::json->'exam_date')::date >= $3::date"
        }
        */

        const viewCreation3 = await db.query(studentsWithDegreesView)
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
        let args=[
            examId,
            studentUsername
        ]
        const result = await db.query(query,args)
        let rows=result.rows.filter((r)=>{
            if(since=="any"){
                return true
            }
            return new Date(r.exam.exam_date) >= new Date(since)
        })
        res.json({"exam_enrolments":rows})
        next()
    })

    const examEnrolmentBody={required:[
        "exam_id",
        "enrolment_type",
        "student"
    ]}
    app.post("/inscripciones_final",schemaValidation({body:examEnrolmentBody}),async function(req,res,next){
        const queryInsert=`
        insert into exam_enrolments(
            exam_id,
            student_username,
            creation,
            grade,
            grade_date,
            enrolment_type
        ) values (
            $1,
            $2,
            NOW(),
            -1,
            NOW(),
            $3
        )
        ;
        `
        const insertResult = await db.query(queryInsert,[
            req.body["exam_id"],
            req.body["student"],
            req.body["enrolment_type"],
        ])
        const querySelect=`
        select
            exams_with_data as exam,
            student,
            creation,
            grade,
            grade_date,
            enrolment_type
        from exam_enrolments_with_data
        where
            exam_id=$1
        and student_username=$2
        ;
        `
        const selectResult = await db.query(querySelect,[
            req.body["exam_id"],
            req.body["student"]
        ])
        res.json({"exam_enrolment":selectResult.rows[0]})
        next()
    })

    app.delete("/inscripciones_final/:id",async function(req,res,next){
        const partsId = req.params["id"].split("-")
        const examId=partsId[0]
        const studentId=partsId[1]

        const queryDelete=`
        delete from exam_enrolments where
            exam_id=$1
        and student_username=$2
        ;
        `
        await db.query(queryDelete,[
            examId,studentId
        ])
        res.sendStatus(204)
        next()
    })

}

module.exports={
    mountRoutes:mountRoutes
}