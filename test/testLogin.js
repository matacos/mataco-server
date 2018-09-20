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

describe("Test login",()=>{
    it("Happy path", async()=>{
        const response=await login("jose","jojo")
        console.log("$")
        console.log("$")
        console.log("$")
        console.log("$")
        console.log("$")
        console.log(response.user)
        expect(response).to.be.jsonSchema({
            type:"object",
            required:["token","user"],
            properties:{
                "token":{type:"string"},
                "user":{
                    type:"object",
                    properties:{
                        username:{type:"string"},
                        email:{type:"string"},
                        roles:{
                            const:["students"]
                        },
                        rolesDescriptions:{
                            type:"object",
                            properties:{
                                "students":{
                                    const:{
                                        "username":"jose",
                                        "degree":"1"
                                    }
                                },
                            },
                            required:["students"]
                        }
                    },
                    required:["username","email","roles"]
                },
            }
        })
    })
    it("Happy path hybrid", async()=>{
        const response=await login("gryn","777")
        console.log(response)
        console.log(response)
        expect(response).to.be.jsonSchema({
            type:"object",
            required:["token","user"],
            properties:{
                "token":{type:"string"},
                "user":{
                    type:"object",
                    properties:{
                        username:{type:"string"},
                        email:{type:"string"},
                        roles:{
                            allOf:[
                                {contains:{const:'department_administrators'}},
                                {contains:{const:'professors'}},
                                {uniqueItems:true},
                                {maxItems:2}
                            ]
                        },
                        rolesDescriptions:{
                            type:"object",
                            properties:{
                                "department_administrators":{type:"object"},
                                "professors":{type:"object"},
                            },
                            required:["department_administrators","professors"]
                        }
                    },
                    required:["username","email","roles"]
                },
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
    it("happy path Jose",async()=>{
        const loginResponse=await login("jose","jojo")
        console.log(loginResponse)
        
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
        console.log(response.body)

    })
    it("bad token",async()=>{
        const loginResponse=await login("jose","jojo")
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
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const loginResponse2=await login("jose","jojo")
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