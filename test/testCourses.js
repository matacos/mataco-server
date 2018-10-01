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

const correctProfessorSchema={
    properties:{
        "professor":{
            type:"object",
            required:["username", "name", "surname"],
            properties:{
                "username":{type:"string"},
                "name":{type:"string"},
                "surname":{type:"string"}
            }
        }
    },
    required:["professor"]
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

        const responseInit = await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")

        console.log("Here -1 \n")
        console.log(responseInit.body)
        console.log("Here 0 \n")

        expect(responseInit.statusCode).to.equal(200)
        expect(responseInit.body.courses).to.have.lengthOf(1)


        const response1 = await requestWithAuth("99999","9","POST","/cursos",{
            "cod_departamento":"75",
            "cod_materia":"06",
            "nombre":"Seminario I",
            "vacantes_totales":20
        })

        console.log("Here 1 \n")
        console.log(response1.body)
        console.log("Here 2 \n")

        expect(response1.statusCode).to.equal(201)

        const response2 = await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")

        console.log("Here 3 \n")
        console.log(response2.body)
        console.log("Here 4 \n")

        expect(response2.statusCode).to.equal(200)
        expect(response2.body.courses).to.have.lengthOf(2)
        
         const response3 = await requestWithAuth("99999","9","DELETE","/cursos/3")

         console.log("Here 5 \n")
         console.log(response3.body)
         console.log("Here 6 \n")

        expect(response3.statusCode).to.equal(204)

        const response4 = await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")

        console.log("Here 7 \n")
        console.log(response4.body)
        console.log("Here 8 \n")

        expect(response4.statusCode).to.equal(200)
        expect(response4.body.courses).to.have.lengthOf(1)     
    })


    it("Adding hours to an empty course and removing them",async ()=>{

        await requestWithAuth("99999","9","POST","/cursos",{
            "cod_departamento":"75",
            "cod_materia":"06",
            "nombre":"Cátedra Peronista",
            "vacantes_totales":67
        })

        const response2=await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")
        let course=response2.body.courses.filter((x)=>x.name.includes("Peronista"))[0]
        const courseId=course.course
        const postResponse = await requestWithAuth("99999","9","POST",`/cursos/${courseId}/horarios`,{
            classroomCode:'200',
            classroomCampus:'Paseo Colón',
            beginningHour:18,
            beginningMinutes:00,
            endingHour:22,
            endingMinutes:15,
            dayOfWeek:"lun",
            description:"yeah"
        })
        expect(postResponse.statusCode).to.equal(201)

        const response3=await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")
        let slot =response3.body.courses.filter((x)=>x.name.includes("Peronista"))[0].time_slots[0]
        console.log(slot)
        expect(slot.description).to.equal("yeah")
        expect(slot.day_of_week).to.equal("lun")

        const response4=await requestWithAuth("99999","9","DELETE",`/cursos/${courseId}/horarios/${slot.id}`)

        expect(response4.statusCode).to.equal(204)

        const response5=await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")
        let courseAgain =response5.body.courses.filter((x)=>x.name.includes("Peronista"))[0]

        expect(courseAgain.time_slots).to.be.lengthOf(0)

        await requestWithAuth("99999","9","DELETE",`/cursos/${courseId}`)
    })
     
/*
    it("happy path delete",async ()=>{
        
         const response3 = await requestWithAuth("99999","9","DELETE","/cursos/2")

         console.log("Here 9 \n")
         console.log(response3.body)
         console.log("Here 10 \n")

        expect(response3.statusCode).to.equal(204)

        const response4 = await requestWithAuth("99999","9","GET","/cursos?cod_departamento=75&cod_materia=06")

        console.log("Here 11 \n")
        console.log(response4.body)
        console.log("Here 12 \n")

        expect(response4.statusCode).to.equal(200)
        expect(response4.body.courses).to.have.lengthOf(0)
    })
    */ 

   it("happy path get docente",async ()=>{

    const responseInit = await requestWithAuth("99999","9","GET","/docente?username=12345678")

    console.log("Here 13 \n")
    console.log(responseInit.body)
    console.log("Here 14 \n")

    expect(responseInit.body).to.be.jsonSchema(correctProfessorSchema)
    expect(responseInit.statusCode).to.equal(200)

    })

    it("happy path get docentes",async ()=>{

    const responseInit = await requestWithAuth("99999","9","GET","/docentes")

    console.log("Here 13 \n")
    console.log(responseInit.body)
    console.log("Here 14 \n")

    expect(responseInit.body.professors).to.have.lengthOf(4)
    expect(responseInit.statusCode).to.equal(200)

    })

    it("happy path query post de profesor a curso",async ()=>{

        const responseInit = await requestWithAuth("99999","9","GET","/docentes")

        console.log("Here 15 \n")
        console.log(responseInit.body)
        console.log("Here 16 \n")
    
        expect(responseInit.body.professors).to.have.lengthOf(4)
        expect(responseInit.statusCode).to.equal(200)


        const response1 = await requestWithAuth("99999","9","POST","/cursos/id/docentes",{
            "username":"12345678",
            "id":1,
            "rol":"Ayudante de cátedra"
            })
    
        console.log("Here 17 \n")
        console.log(response1.body)
        console.log("Here 18 \n")
        
        expect(response1.statusCode).to.equal(201)
        
        const response2 = await requestWithAuth("99999","9","GET","/cursos?profesor=12345678")

        console.log(response2.body)
    
        expect(response2.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response2.body.courses).to.have.lengthOf(2)
        expect(response2.statusCode).to.equal(200)

        })

    it("happy path query delete de profesor a curso",async ()=>{

        const responseInit = await requestWithAuth("99999","9","GET","/docentes")

        console.log("Here 15 \n")
        console.log(responseInit.body)
        console.log("Here 16 \n")
    
        expect(responseInit.body.professors).to.have.lengthOf(4)
        expect(responseInit.statusCode).to.equal(200)


        const response1 = await requestWithAuth("99999","9","POST","/cursos/id/docentes",{
            "username":"39111222",
            "id":2,
            "rol":"Ayudante de cátedra"
            })
    
        console.log("Here 17 \n")
        console.log(response1.body)
        console.log("Here 18 \n")
        
        expect(response1.statusCode).to.equal(201)
        
        const response2 = await requestWithAuth("99999","9","GET","/cursos?profesor=39111222")

        console.log(response2.body)
    
        expect(response2.body).to.be.jsonSchema(correctCoursesSchema)
        expect(response2.body.courses).to.have.lengthOf(2)
        expect(response2.statusCode).to.equal(200)
                
            const response3 = await requestWithAuth("99999","9","DELETE","/cursos/id/docentes/2-39111222")

            console.log("Here 5 \n")
            console.log(response3.body)
            console.log("Here 6 \n")
   
           expect(response3.statusCode).to.equal(204)
   
           const response4 = await requestWithAuth("99999","9","GET","/cursos?profesor=39111222")
    
           console.log(response4.body)
       
           expect(response4.body).to.be.jsonSchema(correctCoursesSchema)
           expect(response4.body.courses).to.have.lengthOf(1)
           expect(response4.statusCode).to.equal(200)
            
        })

})