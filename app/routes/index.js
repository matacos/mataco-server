const security=require("./security")
function mountRoutes(app,db){




    let Validator=require('express-json-validator-middleware').Validator
    let validate = new Validator({allErrors:true}).validate;

    const mung = require('express-mung');
    const Router = require('express-promise-router')


    function checkSchemas(schemas){
        responseAdditionMiddleware=mung.json(function(body,req,res){
            body.jsonSchemasValidated=schemas
            return body
        })

        let validationMiddleware=validate(schemas)
        function additionMiddleware(req,res,next){
            req.jsonSchemasValidated=schemas
            next()
        }
        return [
            responseAdditionMiddleware,
            additionMiddleware,
            validationMiddleware
        ]
    }



    /*
    ESTE ENDPOINT ES NECESARIO PARA QUE EL FRAMEWORK DE TEST SEPA QUE EL SERVER EXISTE Y ESTÁ DESPIERTO, Y QUE SE HABLA CON LA BASE DE DATOS. Espera esta respuesta antes de arrancar con los test.
    */
    let promiseRouter=Router()
    promiseRouter.get('/',async function (req, res) {
        const resultado = await db.query("select texto from tabla_prueba2;")
        res.send(resultado.rows)
    });


    security.mountRoutes(app,db,checkSchemas)





    promiseRouter.get("/materias",security.authenticate,function(req,res){
        res.json({
            "vamos":"todavia"
        })
    })

    app.use(promiseRouter)

    app.use(function(err, req, res, next) {
        var responseData;

        if (err.name === 'JsonSchemaValidationError') {
            // Set a bad request http response status or whatever you want
            res.status(400);

            // Format the response body however you want
            responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validationErrors,  // All of your validation information
            jsonSchemasValidated:req.jsonSchemasValidated
            };
            res.json(responseData);
        } else {
            // pass error to next error middleware handler
            next(err);
        }
    });

}


module.exports={
    mountRoutes:mountRoutes
}
