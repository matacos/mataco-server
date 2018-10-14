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
const finalsJsonSchema={required:["exams"],properties:{exams:{
    items:{
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
})