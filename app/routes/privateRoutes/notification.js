function mountRoutes(app,db,schemaValidation,notify){
    let notificationBodySchema={
        type:"object",
        required:["message"],
        properties:{
            "message":{type:"string"}
        }
    }
    app.post("/notificacion",
        schemaValidation({body:notificationBodySchema}),
        async(req,res,next)=>{
            const message=req.body.message;

            const firebaseTokensQuery = await db.query(`
                select firebase_token from users;
            `)
            const firebaseTokens=firebaseTokensQuery.rows
                .map((r)=>r.firebase_token)
            await notify.notifyAndroid(firebaseTokens,message)

            const nonstudentEmailTokensQuery= await db.query(`
                select email from users where username not in (select username from students)
            `)
            const emails = nonstudentEmailTokensQuery.rows
                .map((r)=>r.email)

            await notify.notifyEmail(emails,message)

            res.sendStatus(201)
        }
    )
}

module.exports={
    mountRoutes
}

