const Router = require('express-promise-router')
const multer=require("multer")
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const Readable = require('stream').Readable;

function mountRoutes(app,db,schemaValidation){
    /*
    ESTE ENDPOINT ES NECESARIO PARA QUE EL FRAMEWORK DE TEST SEPA QUE EL SERVER EXISTE Y ESTÁ DESPIERTO, Y QUE SE HABLA CON LA BASE DE DATOS. Espera esta respuesta antes de arrancar con los test.
    */
   let promiseRouter=Router()
    promiseRouter.get('/hello',async function (req, res,next) {
        const resultado = await db.query("select texto from tabla_prueba2;")
        res.json(resultado.rows)
        next()
    });

    promiseRouter.post("/estudiantes/csv",upload.single("csv"),async function(req,res,next){
        /*
        Padrón
        Contraseña inicial (en el caso de que este usuario ya exista en el sistema, este campo puede dejarse en blanco)
        Nombre
        Apellido
        Prioridad
        Email
        Lista de carreras a las que está anotado, como enteros separados por guiones.
        */
        const fileText=req.file.buffer.toString("utf8")
        await db.query("drop table if exists students_upload;")
        await db.query(`
        create table students_upload (
            username varchar(10),
            password varchar(30),
            name text,
            surname text,
            priority decimal,
            email varchar(30),
            degrees text
        );
        `)
        const csvStream = new Readable();
        csvStream.push(fileText)
        csvStream.push(null)
        let postgresStream = await db.copyFrom("COPY students_upload FROM STDIN with (format 'csv');")
        csvStream.on("end",()=>{
            console.log("LA SUBIDA A POSTGRES TERMINA A LAS: ",new Date())
        })
        console.log("LA SUBIDA A POSTGRES EMPIEZA A LAS: ",new Date())
        csvStream.pipe(postgresStream)


        
        
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
        console.log(fileText)
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
        console.log("_______________")
    })
    
    
    
   app.use(promiseRouter)
}

module.exports={
    mountRoutes
}