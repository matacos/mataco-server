const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const subjectStatisticsQuery=fs.readFileSync(__dirname+"/subjectStatisticsQuery.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const enrolmentsReportQuery={required:[
        "cod_departamento",
        "ciclo_lectivo"
    ]}
    app.get("/enrolments_report",
    schemaValidation({query:enrolmentsReportQuery}),
    async(req,res,next)=>{
        await db.query(subjectsView);
        await db.query(coursesView);
        const parameters =[
            req.query.ciclo_lectivo,
            req.query.cod_departamento
        ]
        let r = await db.query(subjectStatisticsQuery,parameters);
        res.json({
            "subjects_with_statistics":r.rows
        })
        res.status(200)
        next()
    })

}
module.exports={
    mountRoutes
}