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
        let resultRows=await db.query("select id from degrees;")
        let degrees=resultRows.rows.map((row)=>row.id)
        console.log("--------------------")
        console.log("33333333333333333333")
        console.log(degrees)
        console.log("--------------------")
        console.log("33333333333333333333")
        /*
        Padrón
        Contraseña inicial (en el caso de que este usuario ya exista en el sistema, este campo puede dejarse en blanco)
        Nombre
        Apellido
        Prioridad
        Email
        Lista de carreras a las que está anotado, como enteros separados por guiones.
        */
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log(req.file)
        console.log(req.files)
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        const fileText=req.file.buffer.toString("utf8")

        //validate text file
        const lines=fileText.split("\n")
        let errors=[]
        for(let i=0;i<lines.length;i+=1){
            if(lines.length-1==i && lines[i].length==0){ //salteo la última línea porque está vacía, pero eso no es un error gralmente
                continue
            }

            let currentLine=lines[i]
            let fields=currentLine.split(",")
            function error(description){
                errors.push({
                    line:currentLine,
                    lineNumber:i,
                    error:description
                })
                throw description
            }
            try{
                //validar línea
                if(fields.length!=7){
                    error("Cada línea debería tener 6 campos")
                }
                //validar padrón
                if(fields[0].length==0){
                    error("El padrón no puede estar vacío")
                }
                if(fields[0].length<5 || fields[0].length>6){
                    error("El padrón debe tener 5 o 6 caracteres")
                }
                if(! new RegExp("^[0-9]+$").test(fields[0])){
                    error("El padrón tiene únicamente caracteres numéricos")
                }

                //validar primera contraseña
                if(fields[1].length>=30){
                    error("La contraseña debe tener menos de 30 caracteres")
                }

                //validar nombre
                if(fields[2].length==0){
                    error("El nombre no puede estar vacío")
                }

                //validar apellido
                if(fields[3].length==0){
                    error("El apellido no puede estar vacío")
                }

                //validar prioridad
                if(fields[4].length==0){
                    error("La prioridad no puede estar vacía")
                }
                if(! new RegExp("^[0-9]+$").test(fields[4])){
                    error("El campo 'prioridad' tiene únicamente caracteres numéricos, debe ser un entero")
                }
                let priority=parseInt(fields[4])
                if(priority<1 || priority > 300){
                    error("El campo 'prioridad' debe ser un entero entre 1 y 300")
                }

                //validar email
                if(fields[5].length==0){
                    error("El email no puede estar vacío")
                }
                if(fields[5].length>=100){
                    error("El email debe tener menos de 100 caracteres")
                }

                let splitAt=fields[5].split("@")
                if(splitAt.length!=2){
                    error("El email suministrado no parece ser un email")
                }
                let domainParts=splitAt[1].split(".")
                if(domainParts.length<2){
                    error("El dominio del mail suministrado no parece serlo: "+splitAt[1])
                }
                
                    
                

                //Validar lista de carreras
                if(fields[6].length==0){
                    error("La lista de carreras no puede estar vacía")
                }
                let degrees=fields[6].split("-")
                for(let degree of degrees){
                    if(! new RegExp("^[0-9]+$").test(degree)){
                        error(`"${degree}" no es un número. La lista de carreras debe ser una lista de números enteros separados por guiones, sin espacios`)
                    }
                    if(degrees.indexOf(degree)==-1){
                        error(`"${degree}" No es un identificador de carrera`)
                    }
                }
            }catch(e){
                
                console.log("###############")
                console.log("###############")
                console.log(e)
                console.log("###############")
                console.log("###############")
                
            }
        }
        if(errors.length>0){
            res.json({"errors":errors})
            res.status(400)
            next()
        }


        else {
            //create table for upload
            await db.query("drop table if exists students_upload;")
            await db.query(`
            create table students_upload (
                username varchar(10),
                password varchar(30),
                name text,
                surname text,
                priority decimal,
                email varchar(100),
                degrees text
            );
            `)
            async function introduceUploadedStudents(){
                //insert into the users table
                const updateUsersWithNoPasswords=`
                update users as u
                set
                    email   = su.email, 
                    name    = su.name, 
                    surname = su.surname
                from students_upload as su
                where
                    su.username=u.username
                and su.password is null
                ;
                `
                await db.query(updateUsersWithNoPasswords)

                const updateUsersWithPasswords=`
                update users as u
                set
                    email   = su.email, 
                    name    = su.name, 
                    surname = su.surname,
                    password = su.password
                from students_upload as su
                where
                    su.username=u.username
                and su.password is not null
                ;
                `
                await db.query(updateUsersWithPasswords)

                const insertUsersWithPasswords=`
                insert into users 
                select 
                    username, 
                    password, 
                    email, 
                    name, 
                    surname, 
                    username as token , 
                    now() as token_expiration 
                from students_upload
                where 
                    password is not null
                on conflict do nothing
                ;
                `
                await db.query(insertUsersWithPasswords)

                //insert into the students table
                const insertStudents=`
                insert into students 
                select su.username, su.priority 
                from students_upload as su, users as u
                where su.username=u.username
                on conflict (username) 
                do update set priority = excluded.priority
                ;
                `
                await db.query(insertStudents)

                //insert into degree_enrolments table
                const deleteEnrolments=`
                delete from degree_enrollments as de 
                using students_upload as su 
                where de.student = su.username
                ;
                `
                await db.query(deleteEnrolments)

                const insertEnrolments = `
                insert into degree_enrollments(degree,student)
                select 
                    unnest(string_to_array(su.degrees,'-')) as degree,
                    su.username as student
                from 
                    students_upload as su, 
                    students as s
                where
                    su.username = s.username
                ;
                `
                await db.query(insertEnrolments)

                ///remove the upload students table
                await db.query("drop table if exists students_upload;")
                
                return true
            }

            const csvStream = new Readable();
            csvStream.push(fileText)
            csvStream.push(null)
            let postgresStream = await db.copyFrom("COPY students_upload FROM STDIN with (format 'csv');")
            csvStream.on("end",()=>{
                console.log("LA SUBIDA A POSTGRES TERMINA A LAS: ",new Date())
                introduceUploadedStudents().then((ret)=>{
                    res.sendStatus(201)
                })
            })
            console.log("LA SUBIDA A POSTGRES EMPIEZA A LAS: ",new Date())
            csvStream.pipe(postgresStream)
    }
    })
    
    
    
   app.use(promiseRouter)
}

module.exports={
    mountRoutes
}