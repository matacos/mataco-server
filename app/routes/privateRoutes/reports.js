const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const subjectStatisticsQuery=fs.readFileSync(__dirname+"/subjectStatisticsQuery.sql").toString()
const pollsQuery=fs.readFileSync(__dirname+"/pollsQuery.sql").toString()

function mountRoutes(app,db,schemaValidation){
    const enrolmentsReportQuery={required:[
        "departamento",
        "ciclo_lectivo"
    ]}
    app.get("/enrolments_report",
    schemaValidation({query:enrolmentsReportQuery}),
    async(req,res,next)=>{
        await db.query(subjectsView);
        await db.query(coursesView);

        
        const parameters =[
            req.query.ciclo_lectivo,
            req.query.departamento
        ]
        let r = await db.query(subjectStatisticsQuery,parameters);
        res.json({
            "subjects_with_statistics":r.rows
        })
        res.status(200)
        next()
    })

    app.get("/polls_report",
    schemaValidation({query:enrolmentsReportQuery}),
    async(req,res,next)=>{
        await db.query(subjectsView);
        await db.query(coursesView);
        const parameters =[
            req.query.ciclo_lectivo,
            req.query.departamento
        ]
        async function getTable(tableName){
            return db.query(pollsQuery+`
                select * from ${tableName};
            `,parameters)
        }
        let pollResults={}
        let groupedQuestionsResult = await getTable("grouped_questions");

        for(let r of groupedQuestionsResult.rows){
            pollResults[r.question]=r.results
        }
        pollResults.feedback=(await getTable("chosen_subjects_feedback")).rows

        res.json({
            poll_results:pollResults,
            courses:(await getTable("chosen_courses_with_data")).rows,
            subjects:(await getTable("chosen_subjects_with_data")).rows,
        })

        res.status(200)
        next()
    })

}
module.exports={
    mountRoutes
}