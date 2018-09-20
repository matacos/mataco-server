console.log("PRIMERA LINEA DEL PROGRAMA")

const db=require("./db.js")

var express = require('express');

console.log("ANTES DE IMPORTAR")
const mountRoutes=require("./routes").mountRoutes
console.log("LUEGO DE IMPORTAR")
// cómo estructurar bien el proyecto https://node-postgres.com/guides/async-express

console.log("hola")
console.log("hola")
var app = express();
app.use(require('morgan')('combined'));
app.use(require('body-parser').json());

console.log("hola2")


mountRoutes(app,db)

console.log("hola3")


app.use(function(err,req,res,next){
    console.log("Error:")
    console.log(err)
    res.send(err)
})

console.log("hola4")


let port = process.env.PORT || 3000
console.log("------------------------")
console.log("$PORT es " + process.env.PORT)
app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
