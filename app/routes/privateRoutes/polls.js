function mountRoutes(app,db,schemaValidation){

    
    const pollBody={required:[
        "course",
        "student",
        "q1",
        "q2",
        "q3",
        "q4",
        "q5",
        "q6",
        "q7",
        "passed",
        "feedback",
    ],
        type:"object",
        properties:{
            "course":{type:"number"},
            "student":{type:"string"},
            "q1":{type:"number", minimum:0, maximum:10},
            "q2":{type:"number", minimum:0, maximum:10},
            "q3":{type:"number", minimum:0, maximum:10},
            "q4":{type:"number", minimum:0, maximum:10},
            "q5":{type:"number", minimum:0, maximum:10},
            "q6":{type:"number", minimum:0, maximum:10},
            "q7":{type:"number", minimum:0, maximum:10},
            "passed":{type:"boolean"},
            "feedback":{type:"string"}
        }
    }
    app.post("/poll",schemaValidation({body:pollBody}),async function(req,res,next){
        let {
            course,
            student,
            q1,
            q2,
            q3,
            q4,
            q5,
            q6,
            q7,
            passed,
            feedback
        }=req.body;

        const query=`
        insert into polls(
            course,
            student,
            q1,q2,q3,q4,q5,q6,q7,
            passed,
            feedback
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `
        const params=[
            course,
            student,
            q1,
            q2,
            q3,
            q4,
            q5,
            q6,
            q7,
            passed,
            feedback
        ]
        await db.query(query,params);
        res.code(201)
        next()
        
    })

}


module.exports={
    mountRoutes:mountRoutes,
}