const fs=require("fs")
const subjectsView=fs.readFileSync(__dirname+"/subjectsWithData.sql").toString()
const coursesView=fs.readFileSync(__dirname+"/coursesWithData.sql").toString()
const studentsWithDegreesView=fs.readFileSync(__dirname+"/studentsWithDegrees.sql").toString()
const examsWithDataView=fs.readFileSync(__dirname+"/examsWithData.sql").toString()
const examEnrolmentsWithDataView=fs.readFileSync(__dirname+"/examEnrolmentsWithData.sql").toString()
const request=require("request-promise-native")

function mountRoutes(app,db,schemaValidation){
    const examsQuery={anyOf:[{
        properties:{
            "cod_materia":{type:"string"},
            "cod_departamento":{type:"string"},
        },
        required:["cod_materia","cod_departamento"]
    },{
        properties:{
            "docente":{type:"string"},
        },
        required:["docente"]
    }]}
    app.get("/finales",schemaValidation({query:examsQuery}),async function(req,res,next){
        let since=new Date(req.now)
        since.setHours(since.getHours() + 48)// el filtro inicial es ahora + 48hs
        if("since" in req.query){
            if(isNaN(Date.parse(req.query.since))){
                since = req.query.since
            }else{
                since = new Date(req.query.since)
            }
        }
        const viewCreation3 = await db.query(studentsWithDegreesView)
        
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        const viewCreation2 = await db.query(examEnrolmentsWithDataView)
        const department_code = req.query["cod_departamento"]
        const subject_code = req.query["cod_materia"]

        let dateFilter=""
        if(since=="any"){
            dateFilter=""
        }else{
            dateFilter="and ed.exam_date > $5"
        }
        if(since=="current"){
            since=req.semester[0].classes_ending_date
            dateFilter="and ed.exam_date > $5"
        }

        const query=`
        with
        my_enrolments as (
            select exam_id 
            from exam_enrolments 
            where student_username like $4
        ),
        exams_ids as (
            select id 
            from exams_with_data
        ),
        enroled as (
            select id, coalesce(exam_id,0) > 0 as enroled
            from
                exams_ids as eids
                    left outer join my_enrolments as me on (
                        eids.id = me.exam_id
                    )
        )
        select
            ed.id,
            ed.semester_code,
            ed.classroom_code,
            ed.classroom_campus,
            ed.beginning,
            ed.ending,
            ed.exam_date,
            ed.subject,
            ed.examiner,
            er.enroled as enroled
        from exams_with_data as ed,
            enroled as er
        where 
        ed.subject_code like $1
        and ed.department_code like $2
        and ed.examiner_username like $3
        and er.id=ed.id
        ${dateFilter}
        
        ;
        `
        let args=[
            subject_code,
            department_code,
            req.query["docente"] || '%',
            req.user["username"]
        ]
        if(dateFilter!=""){
            args=args.concat([since])
        }
        const result = await db.query(query,args)
        res.json({"exams":result.rows})
        next()
    })

    const examBody={
        required:[
            "semester_code",
            "classroom_code",
            "classroom_campus",
            "beginning",
            "ending",
            "exam_date",
            "subject_code",
            "department_code",
            "examiner_username",
        ],
        properties:{
            "semester_code":{type:"string"},
            "classroom_code":{type:"string"},
            "classroom_campus":{type:"string"},
            "beginning":{type:"string"},
            "ending":{type:"string"},
            "exam_date":{type:"string"},
            "subject_code":{type:"string"},
            "department_code":{type:"string"},
            "examiner_username":{type:"string"},
        }
        

    }

    app.post("/finales",schemaValidation({body:examBody}),async function(req,res,next){
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log(req.body)
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        console.log("#####")
        const query=`
        insert into exams(semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date) 
        values
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        returning *
        ;
        `
        let {
            semester_code,
            department_code,
            subject_code,
            examiner_username,
            classroom_code,
            classroom_campus,
            beginning,
            ending,
            exam_date
        }=req.body
        let params=[semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date]

        let result=await db.query(query,params)
        console.log(result.rows[0])

        const queryGet=`
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
            id = $1
        ;
        `
        let resultGet=await db.query(queryGet,[result.rows[0].id])
        
        res.json({exam:resultGet.rows[0]})
        next()
    })

    app.delete("/finales/:id",async function(req,res,next){
        const viewCreation3 = await db.query(studentsWithDegreesView)
        const viewCreation1 = await db.query(subjectsView)
        const viewCreation = await db.query(examsWithDataView)
        

        // ------------ obtener todos los tokens a los que hya que avisarle -----------------
        const enroledTokensQuery=`
        select u.firebase_token
        from users as u,
            exam_enrolments as ee
        where
            ee.exam_id=$1
        and ee.student_username=u.username
        ;
        `
        const enroledTokensQueryResult=await db.query(enroledTokensQuery,[
            req.params.id
        ])
        console.log("??????????????????????")
        console.log("??????????????????????")
        console.log(enroledTokensQueryResult)
        console.log("??????????????????????")
        console.log("??????????????????????")

        const notifyTokens=enroledTokensQueryResult.rows
            .map((r)=>r.firebase_token)
            .filter((x)=>x!=null)
        console.log("%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%")
        console.log(notifyTokens)
        console.log("%%%%%%%%%%%%%%%%%%%%%%")
        console.log("%%%%%%%%%%%%%%%%%%%%%%")

        // ---------------- generar el examen que voy a enviar ----------------------

        const queryExamData = `
        select * from exams_with_data where id = $1;
        `
        const examDataResult = await db.query(queryExamData,[req.params.id])
        const examData=examDataResult.rows[0]
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        console.log(examData)
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
        let message = "Tu examen de "+examData.subject.name+" del día "+examData.exam_date+" fue cancelado"



        // ---------------- enviarle un mensaje a los tokens esos ------------
        console.log("VOY A HACER BROADCAST A LOS SGTES TOKENS")
        console.log(notifyTokens)
        let requestPayload = {
            "data": {
                "title": "Se canceló un examen",
                "body": message,
                "click_action": "exam_inscriptions",
                "channel_id": "exams"
            },
            "registration_ids": notifyTokens
        }
        const response=await request({
            uri:"https://"+"f"+"c"+"m"+".go"+"og"+"lea"+"pi"+"s.c"+"om/"+"fc"+"m/s"+"end",
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"key=AAAActJi0bE:APA91bFPGJ-zYYcZg-1WcoXPZmmUXEafYSiLbdcHgJFYliWMkGIlL--kBR0BE6C4DTD7J5LmrsfvmyqIGZt0ps0s49Pt-UthdNz9g3WLwVb-Yo5ftnD2gzrCvxkpctBscuWLnCzINnUk"
            },
            body:requestPayload,
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })



        // --------------------- hacer el DELETE ---------------
        const query=`
        delete from exams
        where id=$1
        ;
        `
        await db.query(query,[
            req.params.id
        ])

        res.sendStatus(204)
        next()


    })
}

module.exports={
    mountRoutes:mountRoutes
}