const Router = require('express-promise-router')


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
   app.use(promiseRouter)
}

module.exports={
    mountRoutes
}