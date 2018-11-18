const PromiseRouter = require('express-promise-router')
const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const courseEnrolments=require("./courseEnrolments.js")
const courses=require("./courses.js")
const exams=require("./exams.js")
const examEnrolments=require("./examEnrolments.js")
const semesters=require("./semesters.js")
const academicHistory=require("./academicHistory.js")
const uploadCourseEnrolments=require("./uploadCourseEnrolments.js")
const uploadExamEnrolments=require("./uploadExamEnrolments.js")
const polls=require("./polls.js")
const reports=require("./reports.js")

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
        console.log("########")
        console.log(req.user)
        console.log("########")
        const viewCreation = await db.query(subjectsView)
        let result={}
        let isStudent=req.user.roles.includes("students")

        const studentEnroledQuery=`
        my_enrolments as (
            select course from course_enrollments where student like $3
        ),
        course_ids as (
            select id from courses
        ),
        enroled_courses as (
            select id, coalesce(course,0) > 0 as enroled
            from
                course_ids as cids
                    left outer join my_enrolments as me on (
                        cids.id = me.course
                    )
        ),
        only_approved_courses as (
            select course 
            from course_enrollments 
            where 
                student like $3
            and grade >= 4
        ),
        approved_courses as (
            select id, coalesce(course,0) > 0 as approved_course
            from
                course_ids as cids
                    left outer join only_approved_courses as ac on (
                        cids.id = ac.course
                    )
        ),
        enroled_subjects_part as (
            select 
                c.department_code, 
                c.subject_code as code, 
                bool_or(ec.enroled) as enroled,
                bool_or(ac.approved_course) as approved_course
            from 
                courses as c,
                enroled_courses as ec,
                approved_courses as ac
            where 
                c.id=ec.id
            group by c.department_code, c.subject_code
        ),
        approved_subjects_only as (
            select department_code as department_code, subject_code as code, bool_or(enr.grade>=4) as approved_exam
            from exams as ex
                left outer join exam_enrolments as enr on (
                    ex.id = enr.exam_id
                )
            where student_username like $3
            group by department_code, subject_code
        ),
        enroled_subjects as (
            select 
                s.department_code, 
                s.code, 
                coalesce(esp.enroled,'f') as enroled,
                coalesce(esp.approved_course,'f') as approved_course,
                coalesce(aso.approved_exam,'f') as approved_exam
            from
                subjects as s
                    left outer join enroled_subjects_part as esp on (
                            s.department_code = esp.department_code
                        and s.code = esp.code
                    )
                    left outer join approved_subjects_only as aso on (
                            s.department_code = aso.department_code
                        and s.code = aso.code
                    )
        ),
        

        
        `
        
        const query = `
        with
        ${studentEnroledQuery}
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
            sd.required_subjects,
            es.enroled,
            es.approved_course,
            es.approved_exam as approved
        from
            enroled_subjects as es,
            subjects_with_data as sd,
            selected_subjects as ss
        where

            ss.code = sd.code
        and ss.department_code = sd.department_code

        and ss.code = es.code
        and ss.department_code = es.department_code
        ;
        `
        let student = "%"
        if(isStudent){
            student = req.user["username"]
        }
        result=await db.query(query,[
            req.query.carrera || '%',
            req.query.departamento || '%',
            student
        ])
        
        

        res.json({"subjects":result.rows})
        //
        //res.json(resultado.rows)
        next()
    });


    
    courseEnrolments.mountRoutes(promiseRouter,db,schemaValidation)
    courses.mountRoutes(promiseRouter,db,schemaValidation)
    exams.mountRoutes(promiseRouter,db,schemaValidation)
    examEnrolments.mountRoutes(promiseRouter,db,schemaValidation)
    semesters.mountRoutes(promiseRouter,db,schemaValidation)
    academicHistory.mountRoutes(promiseRouter,db,schemaValidation)
    uploadCourseEnrolments.mountRoutes(promiseRouter,db,schemaValidation)
    uploadExamEnrolments.mountRoutes(promiseRouter,db,schemaValidation)
    polls.mountRoutes(promiseRouter,db,schemaValidation)
    reports.mountRoutes(promiseRouter,db,schemaValidation)

    

    app.use(promiseRouter)
}


module.exports={
    mountRoutes:mountRoutes,
    getSemesterFromDate:semesters.getSemesterFromDate
}