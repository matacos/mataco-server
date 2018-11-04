function mountRoutes(app,db,schemaValidation){
    app.get("/ciclo_lectivo_actual",async function (req,res,next){
        console.log("ESTOY EN EL ENDPOINT POSTA")
        console.log(req.semester)
        res.json({
            "semesters":req.semester
        })
        next()
    })
    app.get("/ciclos_lectivos",async function(req,res,next){
        const result = await db.query(`select * from semesters`)
        res.json({"semesters":result.rows})
        next()
    })

    const semesterBody={
        type:"object",
        required:[
            "academic_offer_release_date",
            "course_enrollment_beginning_date",
            "course_enrollment_ending_date",
            "classes_beginning_date",
            "course_disenrollment_ending_date",
            "exam_offer_release_date",
            "classes_ending_date",
            "exams_ending_date",
            "code",
        ],
        properties:{
            "code":{
                type:"string",
                maxLength:10,
                minLength:1
            }
        }
    }
    app.post("/ciclos_lectivos",schemaValidation({body:semesterBody}),async function(req,res,next){
        const query=`
        insert into semesters(
            academic_offer_release_date,
            course_enrollment_beginning_date,
            course_enrollment_ending_date,
            classes_beginning_date,
            course_disenrollment_ending_date,
            exam_offer_release_date,
            classes_ending_date,
            exams_ending_date,
            code
        ) 
        values
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        returning *
        ;
        `
        let {
            academic_offer_release_date,
            course_enrollment_beginning_date,
            course_enrollment_ending_date,
            classes_beginning_date,
            course_disenrollment_ending_date,
            exam_offer_release_date,
            classes_ending_date,
            exams_ending_date,
            code
        }=req.body
        let queryData=[
            academic_offer_release_date,
            course_enrollment_beginning_date,
            course_enrollment_ending_date,
            classes_beginning_date,
            course_disenrollment_ending_date,
            exam_offer_release_date,
            classes_ending_date,
            exams_ending_date,
            code
        ]

        let added= await db.query(query,queryData)
        res.status(201)
        res.json({"semester":added.rows[0]})
        
        next()
        
    })

}

async function getSemesterFromDate(db,date){
    console.log("%%%%%%%%%%%%%%%%%%%%%%")
    console.log("%%%%%%%%%%%%%%%%%%%%%%")
    console.log("Me preguntan por el date:")
    console.log(date)
    console.log("%%%%%%%%%%%%%%%%%%%%%%")
    console.log("%%%%%%%%%%%%%%%%%%%%%%")
    const result = await db.query(`
    select * 
    from semesters
    where 
        course_enrollment_beginning_date < $1
    and $1 < exams_ending_date
    ;
    `,
    [date])
    return result.rows
}

module.exports={
    mountRoutes:mountRoutes,
    getSemesterFromDate:getSemesterFromDate
}