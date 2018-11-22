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

describe("Test reports",()=>{
    function get(url){
        return requestWithAuth("97452","jojo","GET",url)
    }
    function post(url,body){
        return requestWithAuth("97452","jojo","POST",url,body)
    }
    function put(url,body){
        return requestWithAuth("97452","jojo","PUT",url,body)
    }

    it("test enrollment report for department 75 and 1c2018, should have 4 enrolments total",async ()=>{
        const r = await get("/enrolments_report?departamento=Computación&ciclo_lectivo=1c2018");
        
        const schema7506={properties:{
            "code":{const:"06"},
            "total_students":{const:"2"}
        }}
        const schema7507={properties:{
            "code":{const:"07"},
            "total_students":{const:"1"}
        }}
        const schema7552={properties:{
            "code":{const:"52"},
            "total_students":{const:"1"}
        }}
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7506})
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7507})
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7552})

    })

    it("test polls report for department 75 and 1c2018, should have 4 enrolments total",async ()=>{
        const r = await get("/polls_report?departamento=Computación&ciclo_lectivo=1c2018");

        expect(r.body).to.be.jsonSchema({
            type:"object",
            required:[
                "poll_results",
                "courses",
                "subjects"
            ],
            properties:{
                "poll_results":{
                    required:[
                        "q1",
                        "q2",
                        "q3",
                        "q4",
                        "q5",
                        "q6",
                        "q7",
                        "passed",
                        "feedback",
                    ]
                }
            }
        })
        expect(r.statusCode)
        /*
        const schema7506={properties:{
            "code":{const:"06"},
            "total_students":{const:"2"}
        }}
        const schema7507={properties:{
            "code":{const:"07"},
            "total_students":{const:"1"}
        }}
        const schema7552={properties:{
            "code":{const:"52"},
            "total_students":{const:"1"}
        }}
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7506})
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7507})
        expect(r.body.subjects_with_statistics).to.be.jsonSchema({contains:schema7552})
        */
    })
})