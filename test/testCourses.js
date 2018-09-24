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

describe("Test /courses",()=>{
    it("happy path (query courses of subject)",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/cursos?cod_departamento=75&cod_materia=06"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        console.log(response.body.courses[0])

        expect(response.body).to.be.jsonSchema({
            properties:{
                "courses":{
                    type:"array",
                    items:{type:"object",properties:{
                        "department_code":{const:"75"},
                        "subject_code":{const:"06"},
                        "name":{type:"string"},
                        "total_slots":{type:"number"},
                        "professors":{type:"array",items:{
                            required:[
                                "name",
                                "surname",
                                "username",
                                "role"
                            ]
                        }},
                        "time_slots":{type:"array",items:{
                            required:[
                                "classroom_code",
                                "classroom_campus",
                                "beginning",
                                "ending",
                                "day_of_week",
                                "description"
                            ]
                        }}
                    }}

                }
            },
            required:["courses"]
        })
        expect(response.statusCode).to.equal(200)
    })
    
    it("/cursos only works if you query for a subject",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/cursos"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.statusCode).to.equal(400)
    })

})