const security=require("./security")
const validation=require("./validation")
const publicRoutes=require("./publicRoutes")
const privateRoutes=require("./privateRoutes")

function mountRoutes(app,db){

    app.use(function (req,res,next){
        if(req.query.now){
            req.now=Date.parse(req.query.now)
        }else{
            req.now=new Date()
        }
        next()
    })

    //monto /login y /logout
    security.mountRoutes(app,db,validation.schemaValidationMiddlewares)


    //monto rutas públicas
    publicRoutes.mountRoutes(app,db,validation.schemaValidationMiddlewares)

    //monto el middleware que chequea seguridad
    app.use(security.authenticate)
    //monto rutas protegidas
    privateRoutes.mountRoutes(app,db,validation.schemaValidationMiddlewares)
    //monto el middleware que agrega las cuestiones de los jsonSchemas
    validation.mountErrorRoutes(app,db)
}


module.exports={
    mountRoutes:mountRoutes
}
