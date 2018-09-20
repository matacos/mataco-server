let Validator=require('express-json-validator-middleware').Validator
let validate = new Validator({allErrors:true}).validate;
const mung = require('express-mung');

function schemaValidationMiddlewares(schemas){
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

function mountErrorRoutes(app,db){
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
    schemaValidationMiddlewares,
    mountErrorRoutes
}