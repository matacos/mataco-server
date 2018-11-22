const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect

function url(str){
    return "http://app:3000/api"+str
}

async function login(username,password){
    const body={
        username,
        password
    }
    const response=await request({
        uri:url("/login"),
        body,
        method:"POST",
        json:true,
        resolveWithFullResponse:true,
        simple:false
    })
    return response
}
async function requestWithAuth(username,password,verb,uriPart,body){
    const loginResponse=await login(username,password)
    const token=loginResponse.body.token
    const response=await request({
        uri:url(uriPart),
        method:verb,
        headers:{
            "Authorization":"bearer "+token
        },
        body:body,
        simple:false,
        resolveWithFullResponse:true,
        json:true
    })
    return response
}

describe("Test notification endpoint",()=>{
    const getSchema={
        type:"object",
        required:["notifications"],
        property:{
            "notifications":{
                type:"array",
                items:{
                    required:[
                        "creation",
                        "message",
                        "title"
                    ]
                }
            }
        }
    }
    it("primer GET",async ()=>{

        const r = await requestWithAuth("gryn","777","GET","/notificaciones")
        expect(r.statusCode).to.be.eq(200)
        expect(r.body).to.be.jsonSchema(getSchema)
        expect(r.body.notifications).to.be.lengthOf(3)
    })

    it("POST ",async ()=>{
        const body={
            "message":"Este es un mensaje de prueba."
        }
        const r = await requestWithAuth("gryn","777","POST","/notificaciones",body)
        expect(r.statusCode).to.be.eq(201)
    })

    it("segundo GET",async ()=>{
        const r = await requestWithAuth("gryn","777","GET","/notificaciones")
        expect(r.statusCode).to.be.eq(200)
        expect(r.body).to.be.jsonSchema(getSchema)
        expect(r.body.notifications).to.be.lengthOf(4)
    })
})