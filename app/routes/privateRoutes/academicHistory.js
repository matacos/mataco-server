const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const examsWithDataView=fs.readFileSync(__dirname+"/examsWithData.sql").toString()
const examEnrolmentsWithDataView=fs.readFileSync(__dirname+"/examEnrolmentsWithData.sql").toString()

function mountRoutes(app,db,schemaValidation){
    app.get("/:id/historial_academico",async function(req,res,next){
        await db.query(studentsWithDegreesView)
        await db.query(subjectsView)
        await db.query(coursesView)
        await db.query(examsWithDataView)
        await db.query(examEnrolmentsWithDataView)

        const studentUsername = req.params.id || "%"

        // ---------------- GET ALL ENROLMENTS -------- //
        const queryCourseEnrolments=`
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
        and grade <> -1
        ;`
        const resultCourseEnrolments=await db.query(queryCourseEnrolments,[studentUsername])

        let passedCourses={}
        for(let enrolment of resultCourseEnrolments.rows){
            let fullSubjectCode = enrolment.course.department_code + "." + enrolment.course.subject_code
            let fullSemesterCode=enrolment.course.semester

            passedCourses[fullSubjectCode] = fullSemesterCode
        }

        console.log("========================")
        console.log("###########ENROLMENTS#############")
        console.log("========================")
        console.log(passedCourses)
        console.log("========================")
        console.log("########################")
        console.log("========================")

        // ---------- GET ORDERED SEMESTERS --------- //
        const semestersResult = await db.query(`
        select * 
        from semesters
        order by exams_ending_date asc
        ;`)
        let semesters=semestersResult.rows.map((x,i,a)=>{
            if(i<a.length-1){
                x.next=a[i+1]
            }else{
                x.next=null
            }
            return x
        })
        let keyedSemesters={}
        for(let s of semesters){
            keyedSemesters[s.code]=s
        }
        keyedSemesters[null]={next:null}
        console.log("========================")
        console.log("##### KEYED SEMESTERS #############")
        console.log("========================")
        console.log(keyedSemesters)
        console.log("========================")
        console.log("########################")
        console.log("========================")

        // ------- GET EXAMABLE (?) SEMESTERS --------- //
        let examableSemesters={}
        for(let k in passedCourses){
            let approvalSemester=passedCourses[k]
            let followingSemester=keyedSemesters[approvalSemester].next.code || null
            let nextSemester=keyedSemesters[followingSemester].next.code || null
            examableSemesters[k]=[
                approvalSemester,
                followingSemester,
                nextSemester
            ].filter((x)=>x!=null)
        }

        console.log("========================")
        console.log("##### EXAMABLE SEMESTERS #############")
        console.log("========================")
        console.log(examableSemesters)
        console.log("========================")
        console.log("########################")
        console.log("========================")

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
            cast(student_username as text) like $1
        and grade <> -1
        ;
        `
        const result = await db.query(query,[studentUsername])
        const historyItems=result.rows
        const freeExams=historyItems.filter((h)=>{
            return h.enrolment_type=="libre"
        })
        const regularExams=historyItems.filter((h)=>{
            return h.enrolment_type=="regular"
        })

        let historyItemsPerSubject={}
        for(let item of historyItems){
            let fullSubjectCode= item.exam.subject.department_code + "." + item.exam.subject.code
            historyItemsPerSubject[fullSubjectCode] = historyItemsPerSubject[fullSubjectCode] || []
            historyItemsPerSubject[fullSubjectCode].push(item)
        }



        //lo que hay que hace es: 
        //conseguir las cursadas aprobadas
        //conseguir los id de los 3 semestres siguientes
        //si son 3, va el 2 con fecha de la última.
        //si hay al menos una, y ya pasaron los 20 meses, va el 2, con fecha de la última.r
        //LISTO, ESO ES TODO

        //después metés todo junto lo que viene de passedItems y de freeDisapprovedItems. Y listo.
        
        console.log("========================")
        console.log("###########HISTORY ITEMS#############")
        console.log("========================")
        console.log(historyItemsPerSubject)
        console.log("========================")
        console.log("########################")
        console.log("========================")
        res.json({"history_items":historyItems})
        next()
    })
}

module.exports={
    mountRoutes:mountRoutes
}