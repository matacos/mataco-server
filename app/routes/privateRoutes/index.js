const PromiseRouter = require('express-promise-router')
function mountRoutes(app,db,schemaValidation){
    
    let promiseRouter=PromiseRouter()
    promiseRouter.get("/materias",function(req,res){
        res.json({
            "vamos":"todavia"
        })
    })
    app.use(promiseRouter)

}


module.exports={
    mountRoutes:mountRoutes
}