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
        let response = await requestWithAuth("97452","jojo","POST","/cursadas/",{
            "student":"97452",
            "course":"2"
        })
        expect(response.statusCode).to.equal(201)
        response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        expect(response.body.courseInscriptions).to.have.lengthOf(2)


        response = await requestWithAuth("97452","jojo","DELETE","/cursadas/2-97452")
        console.log(response.body)
        expect(response.statusCode).to.equal(204)
        response = await requestWithAuth("97452","jojo","GET","/inscripciones_cursos?estudiante=97452")
        console.log(response.body)
        expect(response.body.courseInscriptions).to.have.lengthOf(1)
    })


})