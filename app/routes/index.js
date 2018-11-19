const security=require("./security")
const validation=require("./validation")
const publicRoutes=require("./publicRoutes")
const privateRoutes=require("./privateRoutes")
const notify=require("./notify.js")

function mountRoutes(app,db){
    let customDate=null;
    app.post("/set_now",function(req,res){
        if(req.query.now){
            customDate=new Date(req.query.now)
        }else{
            customDate=null;
        }
        res.sendStatus(201)
    })

    app.use(function (req,res,next){
        if(customDate==null){
            if(req.query.now){
                req.now=new Date(req.query.now)
            }else{
                req.now=new Date()
            }
        }else{
            req.now=customDate
        }
        next()
    })

    app.use(async function (req,res,next){
        if(req.query.semester){
            req.semester=req.query.semester
        }else{
            req.semester = await privateRoutes.getSemesterFromDate(db,req.now);
        }
        if(req.semester.map){
            req.semester=req.semester.map((s)=>{
                let now=req.now
                const ahora_consultan_cursos_disponibles=(
                        s.academic_offer_release_date <= now
                    &&  now <= s.classes_ending_date
                )
                const ahora_inscriben_cursos=(
                        s.course_enrollment_beginning_date <= now
                    &&  now <= s.course_enrollment_ending_date
                )
                const ahora_desinscriben_cursos=(
                        s.course_enrollment_beginning_date <= now
                    &&  now <= s.course_disenrollment_ending_date
                )
                const ahora_inscriben_finales=(
                        s.exam_offer_release_date <= now
                    &&  now <= s.exams_ending_date
                )
                const ahora_rinden_finales=(
                        s.classes_ending_date <= now
                    &&  now <= s.exams_ending_date
                )
                const ahora_cursan=(
                        s.classes_beginning_date <= now
                    &&  now <= s.classes_ending_date
                )
    
                let code = s.code
                let academic_offer_release_date = s.academic_offer_release_date
                let course_enrollment_beginning_date = s.course_enrollment_beginning_date
                let course_enrollment_ending_date = s.course_enrollment_ending_date
                let classes_beginning_date = s.classes_beginning_date
                let course_disenrollment_ending_date = s.course_disenrollment_ending_date
                let exam_offer_release_date = s.exam_offer_release_date
                let classes_ending_date = s.classes_ending_date
                let exams_ending_date = s.exams_ending_date
                return {
                    code,
                    academic_offer_release_date,
                    course_enrollment_beginning_date,
                    course_enrollment_ending_date,
                    classes_beginning_date,
                    course_disenrollment_ending_date,
                    exam_offer_release_date,
                    classes_ending_date,
                    exams_ending_date,
                    ahora_consultan_cursos_disponibles,
                    ahora_inscriben_cursos,
                    ahora_desinscriben_cursos,
                    ahora_inscriben_finales,
                    ahora_rinden_finales,
                    ahora_cursan,
                    now,
                }
            })

        }
        
        next()
    })

    //monto /login y /logout
    security.mountRoutes(app,db,validation.schemaValidationMiddlewares,notify)


    //monto rutas públicas
    publicRoutes.mountRoutes(app,db,validation.schemaValidationMiddlewares,notify)

    //monto el middleware que chequea seguridad
    app.use(security.authenticate)
    //monto rutas protegidas
    privateRoutes.mountRoutes(app,db,validation.schemaValidationMiddlewares,notify)
    //monto el middleware que agrega las cuestiones de los jsonSchemas
    validation.mountErrorRoutes(app,db)
}


module.exports={
    mountRoutes:mountRoutes
}
