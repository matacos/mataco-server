var express = require('express');
const Pool = require("pg").Pool;

const pool = Pool({
    host:"127.0.0.1",
    port:5444,
    user:"postgres",
    database:"postgres"
    //connectionString:"postgresql://pg-user:pg-user@localhost:5432/pg-prueba"
})
// cómo estructurar bien el proyecto https://node-postgres.com/guides/async-express
var app = express();

app.get('/', function (req, res) {
    pool.connect().then((c)=>{
        c.query("select texto from tabla_prueba;").then((resultado)=>{
            res.send(resultado.rows[0])
        })
    })  
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

//van 30m
