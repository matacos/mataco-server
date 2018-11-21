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

describe("Test polls",()=>{
    function get(url){
        return requestWithAuth("97452","jojo","GET",url)
    }
    function post(url,body){
        return requestWithAuth("97452","jojo","POST",url,body)
    }
    function put(url,body){
        return requestWithAuth("97452","jojo","PUT",url,body)
    }
    it("Pass course 5",async ()=>{
        await put("/cursadas/5-97452",{
            accepted:"true",
            grade:"8"
        })
    })
    it("In the current state, 97452 only owes a poll from course 5 and 5 more jaja", async function(){
        let r=await get("/pending_polls?estudiante=97452")
        expect(r.body.courses).to.lengthOf(6)
        expect(r.body.courses[0].course).to.eq(5)
    })

    it("POST a poll ok",async ()=>{
        let r = await post("/poll",{
            "course":5,
            "student":"97452",
            "q1":4,
            "q2":5,
            "q3":8,
            "q4":9,
            "q5":0,
            "q6":10,
            "q7":6,
            "passed":true,
            "feedback":"hola soy un texto",
        })
        expect(r.statusCode).to.be.eq(201)
    })

    it("In the current state, 97452 owes 5 polls", async function(){
        let r=await get("/pending_polls?estudiante=97452")
        expect(r.body.courses).to.lengthOf(5)
    })
})