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
    required:["courseInscriptions"],
    properties:{"courseInscriptions":{items:{
        properties:{
            "course":{required:[
                "department_code",
                "subject_code",
                "course",
                "name",
                "total_slots",
                "professors",
                "time_slots",
                "semester"
            ]},
            "student":{required:[
                "username",
                "email",
                "name",
                "surname",
                "degrees"
            ]}
        },
        required:["creation","grade","grade_date","student","course"]
        
    }}}
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
describe("Test /inscripciones_cursos",()=>{
    it("test GET without filter query",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_cursos")
        expect(response.statusCode).to.equal(400)
        //expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
    })
    it("test GET filtering by con_nota",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?con_nota=true")
        console.log(response.body)
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        for(let inscription of response.body.courseInscriptions){
            expect(parseFloat(inscription.grade)).to.be.above(0)
        }
    })
    it("test GET filtering by aceptadas",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?aceptadas=true")
        console.log(response.body)
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        
        for(let inscription of response.body.courseInscriptions){
            expect(inscription.accepted).to.be.true
        }
    })
    it("test GET filtering by student",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?estudiante=99999")
        console.log(response.body)
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        for(let inscription of response.body.courseInscriptions){
            expect(inscription.student.username).to.be.equal("99999")
        }
    })
    it("test GET filtering by course",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?curso=1")
        console.log(response.body)
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        for(let inscription of response.body.courseInscriptions){
            expect(inscription.course.course).to.be.equal(1)
        }
    })
    
    it("add 97452 to course 2 (he is enrolled in course 1 already), and then remove him from course 1",async ()=>{
        
        //chequeo que haya 1 inscripción
        let response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        expect(response.body.courseInscriptions).to.have.lengthOf(1)
        let cursoInicial = response.body.courseInscriptions[0]

        //inscribo al estudiante al curso 1
        response = await requestWithAuth("97452","jojo","POST","/cursadas/",{
            "student":"97452",
            "course":"2"
        })
        expect(response.statusCode).to.equal(201)

        //chequeo que haya 2
        response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        expect(response.body.courseInscriptions).to.have.lengthOf(2)

        //desinscribo al estudiante del curso 2
        response = await requestWithAuth("97452","jojo","DELETE","/cursadas/2-97452")
        expect(response.statusCode).to.equal(204)

        // chequeo que haya 1
        response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        expect(response.body.courseInscriptions).to.have.lengthOf(1)

        // le pongo nota
        let date=(new Date()).toISOString()
        response = await requestWithAuth("97452","jojo","PUT","/cursadas/1-97452",{
            accepted:"true",
            grade:"6",
            grade_date:date
        })
        expect(response.statusCode).to.equal(204)

        // chequeo que haya cambiado la nota
        response = await requestWithAuth("97452","jojo","GET","/cursadas?curso=1")
        expect(response.body.courseInscriptions[0].accepted).to.be.true
        expect(response.body.courseInscriptions[0].grade).to.be.equal("6")

        //desinscribo al estudiante del curso 1
        response = await requestWithAuth("97452","jojo","DELETE","/cursadas/1-97452")
        expect(response.statusCode).to.equal(204)

        //inscribo al estudianye al curso 2, con el curso de antes
        let newCourse={
            student:cursoInicial.student.username+"",
            course:cursoInicial.course.course+""
        }
        response = await requestWithAuth("97452","jojo","POST","/cursadas/",newCourse)
        /*
        console.log("======")
        console.log(cursoInicial)
        console.log("======")
        console.log(response.body.validations.body)
        console.log("======")
        console.log(response.body)
        console.log("======")
        console.log(response.body.jsonSchemasValidated)
        console.log("======")
        */
        expect(response.statusCode).to.equal(201)

        // chequeo que haya 1
        response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        expect(response.body.courseInscriptions).to.have.lengthOf(1)
        
    })

})