const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect

function url(str){
    return "http://app:3000"+str
}


async function login(){
    const body={
        username:"jose",
        password:"jojo"
    }
    const response=await request({
        uri:url("/login"),
        body,
        method:"POST",
        json:true
    })
    return response
}

describe("Test login",()=>{
    it("Happy path", async()=>{
        const response=await login()
        expect(response).to.be.jsonSchema({
            type:"object",
            required:["token","user"],
            properties:{
                "token":{type:"string"},
                "user":{type:"object"}
            }
        })
    })
    it("Bad request", async()=>{
        const body={
            usernae:"jose",
            password:"jojo"
        }
        const response=await request({
            uri:url("/login"),
            body,
            method:"POST",
            json:true,
            resolveWithFullResponse: true,
            simple:false
        })
        expect(response.statusCode).to.equal(400)
        expect(response.body).to.be.jsonSchema({
            type:"object",
            required:["validations","jsonSchemasValidated"],
        })
    })
    it("Bad credentials", async()=>{
        const body={
            username:"jose",
            password:"jaja"
        }
        const response=await request({
            uri:url("/login"),
            body,
            method:"POST",
            json:true,
            resolveWithFullResponse: true,
            simple:false
        })
        expect(response.statusCode).to.equal(401)
    })
})
describe("Permissions",()=>{
    it("happy path",async()=>{
        const loginResponse=await login()
        const token=loginResponse.token
        const response=await request({
            uri:url("/materias"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema({
            type:"object",
            properties:{
                token:{type:"string"}
            },
            required:["token"]
        })

    })
    it("bad token",async()=>{
        const loginResponse=await login()
        const token=loginResponse.token
        const response=await request({
            uri:url("/materias"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+"1"
            },
            simple:false,
            resolveWithFullResponse:true
        })
        expect(response.statusCode).to.equal(401)
    })
    it("Token changes",async()=>{
        const loginResponse=await login()
        const token=loginResponse.token
        const loginResponse2=await login()
        const response=await request({
            uri:url("/materias"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true
        })
        expect(response.statusCode).to.equal(401)
    })
})