var express = require('express');
const Pool = require("pg").Pool;
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
let Validator=require('express-json-validator-middleware').Validator
let validate = new Validator({allErrors:true}).validate;
const mung = require('express-mung');
const Router = require('express-promise-router')

function checkSchemas(schemas){
    responseAdditionMiddleware=mung.json(function(body,req,res){
        body.jsonSchemasValidated=schemas
        return body
    })

    let validationMiddleware=validate(schemas)
    function additionMiddleware(req,res,next){
        req.jsonSchemasValidated=schemas
        next()
    }
    return [
        responseAdditionMiddleware,
        additionMiddleware,
        validationMiddleware
    ]
}


//base de datos

let pgConfig=null
if(process.env.DATABASE_URL){
    pgConfig={
        connectionString:process.env.DATABASE_URL 
    }
}else{
    pgConfig={
        //host:"127.0.0.1",
        host:"db",
        port:5432,
        user:"postgres",
        database:"postgres",
        connectionTimeoutMillis:20000 //sin esto, puede ser que el server levante antes que postgres y rompa todo
    }
}
const pool = Pool(pgConfig)
//let connection=await pool.connect()

let poolConnection=null;
async function connection(){
    if(poolConnection==null){
        poolConnection=await pool.connect()    
    }
    return poolConnection
}


// cómo estructurar bien el proyecto https://node-postgres.com/guides/async-express
var app = express();
app.use(require('morgan')('combined'));



app.use(require('body-parser').json());
/*
ESTE ENDPOINT ES NECESARIO PARA QUE EL FRAMEWORK DE TEST SEPA QUE EL SERVER EXISTE Y ESTÁ DESPIERTO, Y QUE SE HABLA CON LA BASE DE DATOS. Espera esta respuesta antes de arrancar con los test.
*/
let promiseRouter=Router()
promiseRouter.get('/',async function (req, res) {
    const c = await connection()
    const resultado = await c.query("select texto from tabla_prueba2;")
    res.send(resultado.rows)
});


let usersDb={
    "jose":{
        password:"jojo",
        token:"sese"
    },
    "flor":{
        password:"floflo",
        token:"rrrrrr"
    },
}

passport.use(new Strategy(async function(token, cb) {
    try{
        const c=await connection()
        const tokenedUsers=await c.query("select * from users where token=$1;",[token])
        if(tokenedUsers.length>0){
            return cb(null,false)
        }else{
            return cb(null,tokenedUsers.rows[0])
        }
    }catch(e){
        return cb(e)
    }
}));



let loginSchema={
    type:"object",
    properties:{
        "username":{type:"string"},
        "password":{type:"string"},
    },
    required:["username","password"],
    additionalProperties:false,
}


promiseRouter.post("/login",checkSchemas({body:loginSchema}),async function(req,res,next){
    let username=req.body.username;
    let password=req.body.password;
    let c=await connection()
    let combinations=await c.query("select * from users where username=$1 and password=$2",[username,password])
    if(combinations.rows.length==0){
        res.sendStatus(401)
    }else{
        let newToken=Math.random()*100+"";
        await c.query("update users set token=$1, token_expiration = now() + '5 minutes' where username=$2",[newToken,username])
        res.json({
            token:newToken,
            user:{
                username,
                email:combinations.rows[0].email,
                //TODO: ROLES AQUÍ!!!
            }
        })
        next()
    }

})

promiseRouter.get("/materias",passport.authenticate('bearer', { session: false }),function(req,res){
    res.send({
        "vamos":"todavia"
    })
})

app.use(promiseRouter)

app.use(function(err, req, res, next) {
    var responseData;

    if (err.name === 'JsonSchemaValidationError') {
        // Set a bad request http response status or whatever you want
        res.status(400);

        // Format the response body however you want
        responseData = {
           statusText: 'Bad Request',
           jsonSchemaValidation: true,
           validations: err.validationErrors,  // All of your validation information
           jsonSchemasValidated:req.jsonSchemasValidated
        };
        res.json(responseData);
    } else {
        // pass error to next error middleware handler
        next(err);
    }
});

app.use(function(err,req,res,next){
    console.log("Error:")
    console.log(err)
    res.send(err)
})

let port = process.env.PORT || 3000
console.log("------------------------")
console.log("pgConfig es:")
console.log(pgConfig)
console.log("$PORT es " + process.env.PORT)
app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
