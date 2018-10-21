const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const examsWithDataView=fs.readFileSync(__dirname+"/examsWithData.sql").toString()
const examEnrolmentsWithDataView=fs.readFileSync(__dirname+"/examEnrolmentsWithData.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const examsQuery={anyOf:[{
        properties:{
            "cod_materia":{type:"string"},
            "cod_departamento":{type:"string"},
        },
        required:["cod_materia","cod_departamento"]
    },{
        properties:{
            "docente":{type:"string"},
        },
        required:["docente"]
    }]}
    app.get("/finales",schemaValidation({query:examsQuery}),async function(req,res,next){
        const viewCreation3 = await db.query(studentsWithDegreesView)
        
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        const viewCreation2 = await db.query(examEnrolmentsWithDataView)
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]
        const query=`
        with
        my_enrolments as (
            select exam_id 
            from exam_enrolments 
            where student_username like $4
        ),
        exams_ids as (
            select id 
            from exams_with_data
        ),
        enroled as (
            select id, coalesce(exam_id,0) > 0 as enroled
            from
                exams_ids as eids
                    left outer join my_enrolments as me on (
                        eids.id = me.exam_id
                    )
        )
        select
            ed.id,
            ed.semester_code,
            ed.classroom_code,
            ed.classroom_campus,
            ed.beginning,
            ed.ending,
            ed.exam_date,
            ed.subject,
            ed.examiner,
            er.enroled as enroled
        from exams_with_data as ed,
            enroled as er
        where 
        ed.subject_code like $1
        and ed.department_code like $2
        and ed.examiner_username like $3
        and er.id=ed.id
        
        ;
        `
        const result = await db.query(query,[
            subject_code,
            department_code,
            req.query["docente"] || '%',
            req.user["username"]
        ])
        res.json({"exams":result.rows})
        next()
    })

    const examBody={
        required:[
            "semester_code",
            "classroom_code",
            "classroom_campus",
            "beginning",
            "ending",
            "exam_date",
            "subject_code",
            "department_code",
            "examiner_username",
        ],
        properties:{
            "semester_code":{type:"string"},
            "classroom_code":{type:"string"},
            "classroom_campus":{type:"string"},
            "beginning":{type:"string"},
            "ending":{type:"string"},
            "exam_date":{type:"string"},
            "subject_code":{type:"string"},
            "department_code":{type:"string"},
            "examiner_username":{type:"string"},
        }
        

    }

    app.post("/finales",schemaValidation({body:examBody}),async function(req,res,next){
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log(req.body)
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        const query=`
        insert into exams(semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date) 
        values
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        returning *
        ;
        `
        let {
            semester_code,
            department_code,
            subject_code,
            examiner_username,
            classroom_code,
            classroom_campus,
            beginning,
            ending,
            exam_date
        }=req.body
        let params=[semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date]

        let result=await db.query(query,params)
        console.log(result.rows[0])

        const queryGet=`
        select
            id,
            semester_code,
            classroom_code,
            classroom_campus,
            beginning,
            ending,
            exam_date,
            subject,
            examiner,
            cast('f' as boolean) as enroled
        from exams_with_data
        where 
            id = $1
        ;
        `
        let resultGet=await db.query(queryGet,[result.rows[0].id])
        
        res.json({exam:resultGet.rows[0]})
        next()
    })
}

module.exports={
    mountRoutes:mountRoutes
}