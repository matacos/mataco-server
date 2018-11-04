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

const timeSchema={
    type:"object",
    required:[
        "code",
        "academic_offer_release_date",
        "course_enrollment_beginning_date",
        "course_enrollment_ending_date",
        "classes_beginning_date",
        "course_disenrollment_ending_date",
        "exam_offer_release_date",
        "classes_ending_date",
        "exams_ending_date"
    ]
}
const currentSemesterSchema={
    required:["semesters"],
    type:"object",
    properties:{
        "semesters":{
            type:"array",
            minItems:1,
            items:timeSchema
        }
    }
}


const oneSemesterSchema={
    required:["semester"],
    type:"object",
    properties:{
        "semester":timeSchema
    }
}



describe("Test times",()=>{
    it("current semester with different dates",async ()=>{
        function transform(username,password,verb){
            return function(uriPart){
                return requestWithAuth(username,password,verb,uriPart)
            }
        }
        const sender=transform("97452","jojo","GET")
        const october2018=await sender("/ciclo_lectivo_actual?now=2018-10-10")
        expect(october2018.body.semesters[0].code).to.equal("2c2018")
        expect(october2018.body).to.be.jsonSchema(currentSemesterSchema)

        const march2018=await sender("/ciclo_lectivo_actual?now=2018-03-10")
        expect(march2018.body.semesters[0].code).to.equal("1c2018")
        expect(march2018.body).to.be.jsonSchema(currentSemesterSchema)

        const october2017=await sender("/ciclo_lectivo_actual?now=2017-10-10")
        expect(october2017.body.semesters[0].code).to.equal("2c2017")
        expect(october2017.body).to.be.jsonSchema(currentSemesterSchema)

        const serverTime=await sender("/ciclo_lectivo_actual")
        expect(serverTime.body).to.be.jsonSchema(currentSemesterSchema)
    })
    it("GET /ciclos_lectivos has a good format",async()=>{
        const response = await requestWithAuth("97452","jojo","GET","/ciclos_lectivos")
        expect(response.body).to.be.jsonSchema(currentSemesterSchema)
        expect(response.body.semesters.length).to.equal(3)
    })
    it("POST /ciclos_lectivos",async()=>{
        
        const semester={
            code:"1c2017",
            academic_offer_release_date:'2018-02-01',
            course_enrollment_beginning_date:'2018-03-01',
            course_enrollment_ending_date:'2018-03-08',
            classes_beginning_date:'2018-03-10',
            course_disenrollment_ending_date:'2018-03-17',
            exam_offer_release_date:'2018-05-05',
            classes_ending_date:'2018-05-08',
            exams_ending_date:'2018-06-08'
        }
        const response = await requestWithAuth("97452","jojo","POST","/ciclos_lectivos",semester)
        expect(response.statusCode).to.equal(201)
        expect(response.body).to.be.jsonSchema(oneSemesterSchema)
    })
    it("GET /ciclos_lectivos has the new semester",async()=>{
        const response = await requestWithAuth("97452","jojo","GET","/ciclos_lectivos")
        expect(response.body).to.be.jsonSchema(currentSemesterSchema)
        expect(response.body.semesters.length).to.equal(4)
    })
})