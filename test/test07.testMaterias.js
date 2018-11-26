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
        json:true
    })
    return response
}
const correctRequestJsonschema={
    properties:{
        "subjects":{type:"array",minItems:1,items:{
                properties:{
                    "name":{type:"string"},
                    "code":{type:"string"},
                    "department_code":{type:"string"},
                    "credits":{type:"array"},
                    "required_credits":{type:"array"},
                    "required_subjects":{type:"array"},
                },
                required:[
                    "name",
                    "code",
                    "department_code",
                    "credits",
                    "required_credits",
                    "required_subjects",
                ]
            }
        },
    },
    required:["subjects"]
}
describe("Test /materias",()=>{
    it("happy path with degrees",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/materias?carrera=10"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        expect(response.statusCode).to.equal(200)
    })

    it("happy path with two degrees",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/materias?carrera=10, 1"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        expect(response.statusCode).to.equal(200)
    })

    it("happy path with departments",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/materias?departamento=Matemática"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        expect(response.statusCode).to.equal(200)
    })

    it("/materias only works if you query for a career",async ()=>{
        const loginResponse=await login("jose","jojo")
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
        /*
        expect(response.body).to.be.jsonSchema({
        })
        */
        expect(response.statusCode).to.equal(400)
    })

})