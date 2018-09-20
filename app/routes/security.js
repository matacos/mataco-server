const mung = require('express-mung');
const Router = require('express-promise-router')
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;

function mountRoutes(app,db,checkSchemas){
    let asyncRouter=Router()

    async function describeRole(username,role){
        const result=await db.query("select * from "+ role +" where username=$1;",[username])
        return result.rows[0];
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


    //AGrego las rutas al roouter que recibí
    app.use(asyncRouter)
}

module.exports={
    mountRoutes,
    authenticate:passport.authenticate('bearer', { session: false })
}
