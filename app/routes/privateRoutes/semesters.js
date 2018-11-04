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