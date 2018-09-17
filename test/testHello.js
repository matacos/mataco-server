const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect


function url(str){
    return "http://app:3000"+str
}

describe("Test that the contents of the sql file are returned",()=>{
    it("'Hola desde setup.sql' is returned", async()=>{
        const response=JSON.parse(await request(url("/")))
        
        expect(response).to.be.jsonSchema({
            const:[{ 
                texto: 'Hola desde setup.sql' 
            }]
        })

        //jsonSchema está buenisimo porque degenera a esa cosa de arriba para checkeos simples (la mayoría, probablemente) pero puede funcionar de formas más avanzadas y copadas, sin demasiado quilombo

        //Usemos async/await para evitar que las promesas nos quemen la cabeza
        
        
    })
})