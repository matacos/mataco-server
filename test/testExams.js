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
    it("test GET without filter query",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales")
        expect(response.statusCode).to.equal(400)
        //expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
    })
    it("test GET filtering by subject",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=07")
        
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalsJsonSchema)
    })
    it("now GET for 75.06 returns no exams",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=06")
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
        const response = await requestWithAuth("jose","jojo","GET","/finales?cod_departamento=75&cod_materia=06")
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
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?estudiante=97452")

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(3)
    })

    it("test GET inscripciones_final filtering by exam id",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1")

        
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log(response.body)
        console.log(response.body.exam_enrolments)
        console.log(response.body.exam_enrolments[0].exam)
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(1)
    })

    it("enrol a student to exam 1",async ()=>{
        const response = await requestWithAuth("jose","jojo","POST","/inscripciones_final",{
            "exam_id":1,
            "enrolment_type":"Regular",
            "student":"99999"
        })
        console.log("###########")
        console.log("###########")
        console.log("###########")
        console.log(response.body)
        console.log("###########")
        console.log("###########")
        console.log("###########")
        expect(response.statusCode).to.equal(200)
    })

    it("test GET inscripciones_final filtering by exam id",async ()=>{
        const response = await requestWithAuth("jose","jojo","GET","/inscripciones_final?id_examen=1")

        
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log(response.body)
        console.log(response.body.exam_enrolments)
        console.log(response.body.exam_enrolments[0].exam)
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        console.log("$$$$$$$$")
        

        expect(response.statusCode).to.equal(200)
        expect(response.body).to.be.jsonSchema(finalEnrolmentsJsonSchema)
        expect(response.body.exam_enrolments).to.be.lengthOf(2)
    })
})