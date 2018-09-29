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
    required:["course_inscriptions"],
    properties:{"course_inscriptions":{items:{
        properties:{
            "course":{required:[
                "department_code",
                "subject_code",
                "course",
                "name",
                "total_slots",
                "professors",
                "time_slots"
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
describe.only("Test /inscripciones_cursos",()=>{
    it("test GET",async ()=>{
        const loginResponse=await login("jose","jojo")
        const token=loginResponse.token
        const response=await request({
            uri:url("/inscripciones_cursos"),
            method:"GET",
            headers:{
                "Authorization":"bearer "+token
            },
            simple:false,
            resolveWithFullResponse:true,
            json:true
        })
        console.log(response.body["course_inscriptions"][0])
        expect(response.body).to.be.jsonSchema(correctRequestJsonschema)
        expect(response.statusCode).to.equal(200)
    })
})