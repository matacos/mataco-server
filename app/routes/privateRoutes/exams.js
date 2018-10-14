const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const examsWithDataView=fs.readFileSync(__dirname+"/examsWithData.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const examsQuery={anyOf:[{
        properties:{
            "cod_materia":{type:"string"},
            "cod_departamento":{type:"string"},
        },
        required:["cod_materia","cod_departamento"]
    }]}
    app.get("/finales",schemaValidation({query:examsQuery}),async function(req,res,next){
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]
        const query=`
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
            subject_code like $1
        and department_code like $2
        ;
        `
        const result = await db.query(query,[subject_code,department_code])
        res.json({"exams":result.rows})
        next()
    })

}

module.exports={
    mountRoutes:mountRoutes
}