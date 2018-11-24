const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()

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
        console.log("1================")

        const query=`
        insert into polls(
            course,
            student,
            q1,q2,q3,q4,q5,q6,q7,
            passed,
            feedback
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `
        console.log("2================")
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
        console.log("3================")
        await db.query(query,params);
        console.log("4================")
        res.status(201)
        res.json({
            response:"OK"
        })
        
        next()
    })

    const pendingPollsQuery ={
        "estudiante":{type:"string"}
    }
    app.get("/pending_polls",schemaValidation({query:pendingPollsQuery}),async function(req,res,next){
        await db.query(subjectsView)
        await db.query(coursesView)
        /*
        const query=`
        select c.*
        from 
            course_enrollments as ce,
            courses_with_data as c,
        where 
            ce.grade_date < $1
        and ce.course = c.course
        and not (ce.course,ce.student) in (select course,student from polls)
        `
        */


        const query=`
        with
        chosen_courses as 
            (select course 
        from course_enrollments 
        where 
            (course,student) not in (
                select course,student from polls
            ) 
            and grade_date < $2 
            and grade >= 4
            and student = $1
        )
        select c.*
        from 
            courses_with_data as c, 
            chosen_courses as cc
        where
            cc.course=c.course
        ;
        `
        let queryResult = await db.query(query,[req.query.estudiante,req.now])
        res.json({"courses":queryResult.rows});
    })

}


module.exports={
    mountRoutes:mountRoutes,
}