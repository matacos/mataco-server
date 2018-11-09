const multer=require("multer")
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const Readable = require('stream').Readable;

function mountRoutes(app,db,schemaValidation){
    app.post(["/inscripciones_cursos/:id/csv_notas","/cursadas/:id/csv_notas"],upload.single("csv"),async function(req,res,next){
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log(req.file)
        console.log(req.files)
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        const fileText=req.file.buffer.toString("utf8")
        console.log(fileText)
        console.log("33333333333333333333")
        console.log("33333333333333333333")
        console.log("33333333333333333333")
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
                if(fields.length!=2){
                    error("Cada línea debería tener 2 campos")
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

                //validar el campo nota
                let validGrades=["-","1","2","3","4","5","6","7","8","9","10"]
                if(validGrades.indexOf(fields[1])==-1){
                    error("El campo de la nota sólo puede tener alguno de los siguientes valores: "+validGrades.map((s)=>"'"+s+"'").join(", "))
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
            await db.query("drop table if exists course_grades_upload;")
            await db.query(`
            create table course_grades_upload (
                username varchar(10),
                grade decimal
            );
            `)
            async function introduceUploadedStudents(){
                /*
                create table course_enrollments(
                course serial,
                foreign key (course) references courses(id) on delete cascade,

                student varchar(10),
                foreign key (student) references students(username),

                creation timestamp,
                accepted boolean,
                grade decimal,
                grade_date date,

                primary key (course,student)
                );
                */
                
                // HACER LAS QUERYS PARA PASAR LAS COSAS A LA TABLA QUE VAN
                let query = `
                update course_enrollments as ce
                set grade_date = NOW(),
                    grade = cgu.grade
                from 
                    course_grades_upload as cgu
                where
                    cgu.username = ce.student
                and ce.course = $1
                ;
                `
                await db.query(query,[req.params.id])






                ///remove the upload students table
                /*
                await db.query("drop table if exists course_grades_upload;")
                */
                
                return true
            }

            let goodFileText=fileText.split("\n").filter((l)=>!l.includes(",-")).join("\n")

            const csvStream = new Readable();
            csvStream.push(goodFileText)
            csvStream.push(null)
            let postgresStream = await db.copyFrom("COPY course_grades_upload FROM STDIN with (format 'csv');")
            csvStream.on("end",()=>{
                console.log("=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)=)")
                console.log("LA SUBIDA A POSTGRES TERMINA A LAS: ",new Date())
                introduceUploadedStudents().then((ret)=>{
                    res.sendStatus(201)
                })
            })
            console.log("LA SUBIDA A POSTGRES EMPIEZA A LAS: ",new Date())
            csvStream.pipe(postgresStream)
        }

    })
    
}

module.exports={
    mountRoutes
}