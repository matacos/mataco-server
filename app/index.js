var express = require('express');
const Pool = require("pg").Pool;


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

/*
ESTE ENDPOINT ES NECESARIO PARA QUE EL FRAMEWORK DE TEST SEPA QUE EL SERVER EXISTE Y ESTÁ DESPIERTO, Y QUE SE HABLA CON LA BASE DE DATOS. Espera esta respuesta antes de arrancar con los test.
*/
app.get('/', function (req, res) {
    pool.connect().then((c)=>{
        return c.query("select texto from tabla_prueba2;").then((resultado)=>{
            res.send(resultado.rows)
        })
    }).catch((e)=>{
        console.log(e)
    })
});

let port = process.env.PORT || 3000
console.log("------------------------")
console.log("pgConfig es:")
console.log(pgConfig)
console.log("$PORT es " + process.env.PORT)
app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
