console.log("PRIMERA LINEA DEL PROGRAMA")

const db=require("./db.js")

var express = require('express');
var cors = require('cors')

const mountRoutes=require("./routes").mountRoutes
// cómo estructurar bien el proyecto https://node-postgres.com/guides/async-express

var app = express();
app.use(cors());
app.use(require('morgan')('combined'));
app.use(require('body-parser').json());

app.use(express.static(__dirname+"/static"))
const apiRouter=express.Router()
mountRoutes(apiRouter,db)
app.use("/api",apiRouter)
app.get("/*",(req,res)=>res.redirect("/"))
//require("./seeder")


let port = process.env.PORT || 3000
console.log("------------------------")
console.log("$PORT es " + process.env.PORT)
app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
