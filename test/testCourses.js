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

async function postCourse(cod_departamento,cod_materia,nombre,vacantes_totales,token){
    const body={
        cod_departamento,
        cod_materia,
        nombre,
        vacantes_totales
    }
    const response=await request({
        uri:url("/cursos"),
        body,
        method:"POST",
        headers:{
            "Authorization":"bearer "+token
        },
        simple:false,
        resolveWithFullResponse:true,
        json:true
    })
    return response
}

async function requestWithAuth(username,password,verb,uriPart,body){
    const loginResponse=await login(username,password)
    const token=loginResponse.token
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

const correctCoursesSchema={
    properties:{
        "courses":{
            type:"array",
            items:{
                type:"object",
                required:[
                    "department_code",
                    "subject_code",
                    "free_slots",
                    "occupied_slots",
                    "total_slots"
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
        const response = await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=07")

        console.log(response.body)

        expect(response.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response.statusCode).to.equal(200)
    })

    it("happy path (query courses of professor)",async ()=>{
        const response = await requestWithAuth("99999","9","GET","/cursos?profesor=39111222")

        console.log(response.body)

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

        console.log(response.body)

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

        console.log(response2.body)
        
        expect(response2.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response2.body.courses[0].enroled).to.be.false
        expect(response2.statusCode).to.equal(200)
        
    })
    
    it("/cursos only works if you query for a subject",async ()=>{
        const response = await requestWithAuth("99999","9","GET","/cursos")

        expect(response.statusCode).to.equal(400)
    })

    it("happy path query post y delete course",async ()=>{
        const response1 = await requestWithAuth("99999","9","POST","/cursos",{
            "cod_departamento":"75",
            "cod_materia":"05",
            "nombre":"Seminario I",
            "vacantes_totales":20
        })
        
        console.log(response1.body)

        expect(response1.statusCode).to.equal(201)

        const response2 = await requestWithAuth("39111222","arar","GET","/cursos?cod_departamento=75&cod_materia=05")

        console.log(response2.body)

        expect(response2.statusCode).to.equal(200)
        expect(response2.body.courses).to.have.lengthOf(1)

        const response3 = await requestWithAuth("39111222","arar","DELETE","/cursos/3")

        console.log(response3.body)

        expect(response3.statusCode).to.equal(204)

        const response4 = await requestWithAuth("39111222","arar","GET","/cursos?cod_departamento=75&cod_materia=05")

        console.log(response4.body)

        expect(response4.statusCode).to.equal(200)
        expect(response4.body.courses).to.have.lengthOf(0)
    })

})