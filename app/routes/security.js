const mung = require('express-mung');
const Router = require('express-promise-router')
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;

function mountRoutes(app,db,checkSchemas){
    let asyncRouter=Router()

    async function describeRole(username,role){
        const result=[]
        if(role=="students"){
            const dbResult = await db.query(
                `select e.student,json_agg(d.data) as enrollments
                from 
                    degree_enrollments as e,
                    (
                        select d.id, row_to_json(d) as data 
                        from degrees as d
                    ) as d
                where
                    e.degree=d.id
                group by e.student
                having e.student=$1;`,
                [username]
            )
            //console.log(dbResult.rows[0].enrollments)
            return dbResult.rows[0];
        }else{
            const dbResult = await db.query("select * from "+ role +" where username=$1;",[username])
            return dbResult.rows[0];
        }
        
    }

    //obtiene roles
    async function areThey(username,role){
        const result=await db.query("select * from "+ role +" where username=$1;",[username])
        return result.rows.length>0
    }
    async function getRolesOf(username){
        const roles=["students","administrators","department_administrators","professors"]
        const pass = await Promise.all(roles.map((r)=>areThey(username,r)))

        return roles.filter((v,i)=>pass[i])
    }

    //estrategia passport
    passport.use(new Strategy(async function(token, cb) {
        console.log("-- hola soy passport --")
        console.log("Recibo el token:",token)
        //TODO: GENERAR TOKENS NUEVOS
        try{
            const tokenedUsers=await db.query("select * from users where token=$1;",[token])
            if(tokenedUsers.rows.length==0){
                return cb(null,false)
            }else{
                const roles = await getRolesOf(tokenedUsers.rows[0].username)
                let user=tokenedUsers.rows[0]
                user.roles=roles
                return cb(null,user)
            }
        }catch(e){
            return cb(e)
        }
    }));

    //Agrega el token a la response
    asyncRouter.use(mung.json(function (body,req,res){
        if(req.user){
            body.token=req.user.token
        }

    }))


    //Lo que debe cumplir el body de /login
    let loginSchema={
        type:"object",
        properties:{
            "username":{type:"string"},
            "password":{type:"string"},
        },
        required:["username","password"],
        additionalProperties:false,
    }


    //Endpoint POST /login
    asyncRouter.post("/login",checkSchemas({body:loginSchema}),async function(req,res,next){
        let username=req.body.username;
        let password=req.body.password;
        let combinations=await db.query("select * from users where username=$1 and password=$2",[username,password])
        if(combinations.rows.length==0){
            res.sendStatus(401)
        }else{
            let newToken=Math.random()*100+"";
            await db.query("update users set token=$1, token_expiration = now() + '5 minutes' where username=$2",[newToken,username])
            const roles = await getRolesOf(username)
            const rolesDescriptions=await Promise.all(roles.map((r)=>describeRole(username,r)))
            let singleRoleDescriptions = roles.map((r,i)=>{
                let o={}
                o[r]=rolesDescriptions[i]
                return o
            })
            let rolesDescriptionsDict=Object.assign(...singleRoleDescriptions)

            res.json({
                token:newToken,
                user:{
                    roles,
                    username,
                    email:combinations.rows[0].email,
                    rolesDescriptions:rolesDescriptionsDict
                }
            })
            next()
        }

    })
    const firebaseTokenSchema={
        required:[
            "username",
            "firebase_token"
        ]
    }
    //Endpoint POST /firebase
    asyncRouter.post("/firebase",checkSchemas({body:firebaseTokenSchema}),async function(req,res,next){
        let username=req.body.username;
        let firebaseToken=req.body.firebase_token;
        console.log("############################")
        console.log("############################")
        console.log("############################")
        console.log("ME LLEGA UN TOKEN")
        console.log(firebaseToken)
        console.log(username)
        console.log("EL BODY ES:")
        console.log(req.body)
        console.log("############################")
        console.log("############################")
        console.log("############################")
        if(firebaseToken.length==0){
            console.log("############################")
            console.log("salteo todo")
            console.log("############################")
            res.sendStatus(201)
            next()
        }
        let query=`
        update users 
        set firebase_token=$2 
        where username=$1
        ;
        `
        await db.query(query,[username,firebaseToken])
        res.sendStatus(201)
        res.json({
            response:"OK"
        })
        next()
    })


    //broadcast
    const request=require("request-promise-native")
    const broadcastSchema={
        required:[
            "msg",
        ]
    }
    asyncRouter.post("/broadcast",checkSchemas({body:broadcastSchema}),async function(req,res,next){
        let query=`
        select firebase_token from users
        ;
        `
        let result = await db.query(query)
        let tokens=result.rows.map((r)=>r.firebase_token).filter((r)=>r!=null)
        console.log("VOY A HACER BROADCAST A LOS SGTES TOKENS")
        console.log(tokens)
        let requestPayload = {
            "data": {
                "title": "Notificacion",
                "body": req.body.msg,
                "click_action": "exam_inscriptions",
                "channel_id": "exams"
            },
            "registration_ids": tokens
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
        res.sendStatus(201)
        next()
    })


    //AGrego las rutas al roouter que recibí
    app.use(asyncRouter)
}

module.exports={
    mountRoutes,
    authenticate:passport.authenticate('bearer', { session: false })
}
