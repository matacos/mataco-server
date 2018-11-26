function mountRoutes(app,db,schemaValidation){
    app.get("/ciclo_lectivo_actual",async function (req,res,next){
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

    app.delete("/ciclos_lectivos/:code",async function(req,res,next){
        const result = await db.query(`delete from semesters where code=$1;`,[req.params.code])
        res.sendStatus(204)
        next()
    })

    const semesterBody={
        type:"object",
        required:[
            "code",
            "academic_offer_release_date",
            "course_enrollment_beginning_date",
            "course_enrollment_ending_date",
            "classes_beginning_date",
            "course_disenrollment_ending_date",
            "exam_offer_release_date",
            "classes_ending_date",
            "exams_ending_date",
            
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

    app.put("/ciclos_lectivos/:code",schemaValidation({body:semesterBody}),async function(req,res,next){
        let fields = [
            "code",
            "academic_offer_release_date",
            "course_enrollment_beginning_date",
            "course_enrollment_ending_date",
            "classes_beginning_date",
            "course_disenrollment_ending_date",
            "exam_offer_release_date",
            "classes_ending_date",
            "exams_ending_date",
            
        ]

        let updatesText=fields.map((f,i)=>{
            return " "+f+"=$"+(i+1)
        })


        const query=`
        update semesters
        set
            ${updatesText.join(",\n")}
        where
            code = $1
        returning *
        ;
        `
        let {
            code,
            academic_offer_release_date,
            course_enrollment_beginning_date,
            course_enrollment_ending_date,
            classes_beginning_date,
            course_disenrollment_ending_date,
            exam_offer_release_date,
            classes_ending_date,
            exams_ending_date
            
        }=req.body
        let queryData=[
            code,
            academic_offer_release_date,
            course_enrollment_beginning_date,
            course_enrollment_ending_date,
            classes_beginning_date,
            course_disenrollment_ending_date,
            exam_offer_release_date,
            classes_ending_date,
            exams_ending_date
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
    academic_offer_release_date < $1
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