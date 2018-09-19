var express = require('express');
const Pool = require("pg").Pool;
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
let Validator=require('express-json-validator-middleware').Validator
let validate = new Validator({allErrors:true}).validate;
const mung = require('express-mung');

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



// cómo estructurar bien el proyecto https://node-postgres.com/guides/async-express
var app = express();
app.use(require('morgan')('combined'));



app.use(require('body-parser').json());
/*
ESTE ENDPOINT ES NECESARIO PARA QUE EL FRAMEWORK DE TEST SEPA QUE EL SERVER EXISTE Y ESTÁ DESPIERTO, Y QUE SE HABLA CON LA BASE DE DATOS. Espera esta respuesta antes de arrancar con los test.
*/
app.get('/',function (req, res) {
    pool.connect().then((c)=>{
        return c.query("select texto from tabla_prueba2;").then((resultado)=>{
            res.send(resultado.rows)
        })
    }).catch((e)=>{
        console.log(e)
    })
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

passport.use(new Strategy(function(token, cb) {
    for(u of Object.keys(usersDb)){
        if(usersDb[u].token==token){
            return cb(null,usersDb[u])

        }
    }
    return cb(null,false)
    /*
    if(token=="yes"){
        return cb(null,{
            name:"Jose",
            dni:"39000000"
        })
    }else{
        return cb(null,false)
    }
    */
    /*
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        return cb(null, user);
    */
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


app.post("/login",checkSchemas({body:loginSchema}),function(req,res,next){
    let username=req.body.username;
    let password=req.body.password;
    if(usersDb[username].password==password){
        usersDb[username].token=Math.random()*100+""
        res.json({
            token:usersDb[username].token,
            user:usersDb[username]
        })
        next()
    }else{
        res.sendStatus(401)
    }
})

app.get("/materias",passport.authenticate('bearer', { session: false }),function(req,res){
    res.send({
        "vamos":"todavia"
    })
})


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
