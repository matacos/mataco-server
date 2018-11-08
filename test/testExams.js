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
const examSchema={
    required:[
        "semester_code",
        "subject",
        "examiner",
        "id",
        "classroom_code",
        "classroom_campus",
        "beginning",
        "ending",
        "exam_date",
        "enroled"
    ]
}
const singleFinalJsonSchema={required:["exam"],properties:{exam:
    examSchema
}}
const finalsJsonSchema={required:["exams"],properties:{exams:{
    items:examSchema
}}}
describe("Test /exams",()=>{

    it("75 07 is not approved in /materias",async()=>{
        //chequeo que esa aprobación aparezca en /materias
        response = await requestWithAuth("97452","jojo","GET","/materias?carrera=10")
        good_subject=null
        for(let s of response.body.subjects){
            if(s.department_code=='75' && s.code=='07'){
                good_subject=s
            }
        }
        console.log("========")
        console.log(good_subject)
        console.log("========")
        console.log("========")
        expect(good_subject).to.not.be.null
        expect(good_subject).to.be.jsonSchema({
            required:["approved"],
            properties:{
                "approved":{const:false}
            }
        })
    })

    it("Change the grade of exam 1 by student 97452",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1&since=any")
        let username = response.body.exam_enrolments[0].student.username
        let examId=response.body.exam_enrolments[0].exam.id

        let modifications ={
            grade:9,
            grade_date:"2018-09-09"
        }
        const putResponse = await requestWithAuth("jose","jojo","PUT","/inscripciones_final/"+examId+"-"+username,modifications)

        const responseAgain = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1&since=any")

        expect(responseAgain.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(responseAgain.body.exam_enrolments).to.be.lengthOf(1)
        expect(responseAgain.body.exam_enrolments[0].grade).to.equal("9")
        expect(responseAgain.body.exam_enrolments[0].grade_date).to.equal("2018-09-09T00:00:00.000Z")
    })

    it("75 07 is approved in /materias",async()=>{
        //chequeo que esa aprobación aparezca en /materias
        response = await requestWithAuth("97452","jojo","GET","/materias?carrera=10")
        good_subject=null
        for(let s of response.body.subjects){
            if(s.department_code=='75' && s.code=='07'){
                good_subject=s
            }
        }
        console.log("========")
        console.log(good_subject)
        console.log("========")
        console.log("========")
        expect(good_subject).to.not.be.null
        expect(good_subject).to.be.jsonSchema({
            required:["approved"],
            properties:{
                "approved":{const:true}
            }
        })
    })
    
    it("test GET without filter query",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?since=any")
        expect(response.statusCode).to.equal(400)
        //expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
    })
    it("test GET filtering by subject",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=07&since=any")
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams).lengthOf(5)
    })
    it("test GET filter by subject and since date", async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=07&since=2018-05-16")
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams).lengthOf(3)
    })
    it("test GET filter by subject and since date", async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=07&since=current&now=2018-03-31")
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams).lengthOf(5)
    })
    it("now GET for 75.06 returns no exams",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=06&since=any")
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams).to.be.lengthOf(0)
    })
    it("test POST",async ()=>{
        let exam={
            semester_code:"1c2018",
            department_code:"75",
            subject_code:"06",
            examiner_username:"39111222",
            classroom_code:"200",
            classroom_campus:"Paseo Colón",
            beginning:"16:55",
            ending:"19:00",
            exam_date:"2018-04-04"
        }
        const response = await requestWithAuth("jose","jojo","POST","/finales",exam)

        
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(singleFinalJsonSchema)
    })
    it("now GET for 75.06 returns an exam",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=06&since=any")
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams).to.be.lengthOf(1)
    })

    const examEnrolmentSchema={
        required:[
            "exam",
            "student",
            "creation",
            "grade",
            "grade_date",
            "enrolment_type"
        ],
        properties:{
            exam:{type:"object"},
            student:{
                type:"object",
                required:[
                    "username",
                    "email",
                    "name",
                    "surname",
                    "degrees",
                    "priority"
                ]
            },
            creation:{type:"string"},
            grade:{type:"string"},
            grade_date:{type:"string"},
            enrolment_type:{type:"string"},
        }
    }
    const finalEnrolmentsJsonSchema={required:["exam_enrolments"],properties:{exam_enrolments:{
        items:examEnrolmentSchema
    }}}
    it("test GET inscripciones_final filtering by student",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?estudiante=97452&since=any")

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(3)
    })

    it("test GET inscripciones_final filtering by student and since date",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?estudiante=97452&since=2018-05-16")

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(2)
    })

    it("test GET inscripciones_final filtering by exam id",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1&since=any")
        console.log("############")
        console.log("############")
        console.log(response.body)
        console.log("############")
        console.log("############")
        console.log(response.body.exam_enrolments[0])
        console.log("############")
        console.log("############")
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(1)
    })
    it("test GET filtering by subject, 99999 is not enroled",async ()=>{
        const response = await requestWithAuth("99999","9","GET","/finales?cod_departamento=75&cod_materia=07&since=any")
        console.log("============")
        console.log("============")
        console.log(response.body.exams[0])
        console.log("============")
        console.log("============")
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams[0].enroled).to.be.false
    })
    it("enrol a student to exam 1",async ()=>{
        const response = await requestWithAuth("jose","jojo","POST","/inscripciones_final",{
            "exam_id":1,
            "enrolment_type":"regular",
            "student":"99999"
        })
        expect(response.statusCode).to.equal(200)
    })
    it("test GET filtering by subject, 99999 is enroled",async ()=>{
        const response = await requestWithAuth("99999","9","GET","/finales?cod_departamento=75&cod_materia=07&since=any")
        console.log("============")
        console.log("============")
        console.log(response.body.exams[0])
        console.log("============")
        console.log("============")
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        expect(response.body.exams[0].enroled).to.be.true
    })

    it("test GET inscripciones_final filtering by exam id",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1&since=any")

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(2)
    })

    it("test DELETE inscripciones_final",async ()=>{
        const response = await requestWithAuth("jose","jojo","DELETE","/inscripciones_final/1-99999")
        expect(response.statusCode).to.equal(204)
    })

    it("test GET inscripciones_final filtering by exam id, the DELETE worked OK",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1&since=any")

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(1)
    })
    it("Delete exam 1",async function(){
        this.timeout(10000);
        const response = await requestWithAuth("jose","jojo","DELETE","/finales/1")
        expect(response.statusCode).to.equal(204)
    })
    it("Exam 1 doesn't exist anymore",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=07&since=any")
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
        let ids=[]
        for(let exam of response.body.exams){
            ids.push(exam.id)
        }
        expect(ids).not.to.include(1)
    })


    
})