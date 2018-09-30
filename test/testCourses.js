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
const correctCoursesSchema={
    properties:{
        "courses":{
            type:"array",
            items:{
                type:"object",
                required:[
                    "department_code",
                    "subject_code"
                ],
                properties:{
                    "name":{type:"string"},
                    "total_slots":{type:"number"},
                    "professors":{type:"array",items:{
                        required:[
                            "name",
                            "surname",
                            "username",
                            "role",
                            
                        ]
                    }},
                    "time_slots":{type:"array",items:{
                        required:[
                            "classroom_code",
                            "classroom_campus",
                            "beginning",
                            "ending",
                            "day_of_week",
                            "description",
                        ]
                    }}
                }
            }

        }
    },
    required:["courses"]
}
describe("Test /cursos",()=>{
    it("happy path (query courses of subject)",async ()=>{
        const loginResponse=await login("99999","9")
        const token=loginResponse.token
        const response=await request({
            uri:url("/cursos?cod_departamento=75&cod_materia=07"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })

        expect(response.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response.statusCode).to.equal(200)
    })
    it("happy path (query courses of professor)",async ()=>{
        const loginResponse=await login("99999","9")
        const token=loginResponse.token
        const response=await request({
            uri:url("/cursos?profesor=39111222"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        console.log("#")
        console.log("#")
        console.log("#")
        console.log("#")

        console.log(response.body)
        console.log("#")
        console.log("#")

        console.log("#")

        expect(response.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response.statusCode).to.equal(200)
    })

    it("97452 is enroled in course 1, and not in course 2",async ()=>{
        const loginResponse=await login("97452","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/cursos?profesor=39111222"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        expect(response.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response.body.courses[0].enroled).to.be.true
        expect(response.statusCode).to.equal(200)

        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log(response.body)
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")


        
        const response2=await request({
            uri:url("/cursos?profesor=12345678"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log(response2.body)
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        console.log("$$$")
        
        expect(response2.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response2.body.courses[0].enroled).to.be.false
        expect(response2.statusCode).to.equal(200)
        
    })
    
    it("/cursos only works if you query for a subject",async ()=>{
        const loginResponse=await login("99999","9")
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