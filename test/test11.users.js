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
        json:true,
        resolveWithFullResponse:true,
        simple:false
    })
    return response
}
async function requestWithAuth(username,password,verb,uriPart,body){
    const loginResponse=await login(username,password)
    const token=loginResponse.body.token
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

describe("Test /me",()=>{
    function get(url){
        return requestWithAuth("97452","jojo","GET",url)
    }
    function post(url,body){
        return requestWithAuth("97452","jojo","POST",url,body)
    }
    function put(url,body){
        return requestWithAuth("97452","jojo","PUT",url,body)
    }

    it("GET /me",async ()=>{
        const r = await requestWithAuth("97452","jojo","GET","/me")
        console.log("================")
        console.log("================")
        console.log(r.body)
        console.log("================")
        console.log("================")
        let user = { 
            username: '97452',
            password: 'jojo',
            email: 'jose.jose@gmail.com',
            name: 'José Ignacio',
            surname: 'Sbruzzi',
            roles: [ 'students' ],
            regular:true
        }
        let schema={
            required:["me"],
            properties:{
                "me":{const:user}
            }
        }
        expect(r.body).to.be.jsonSchema(schema)
    })

    it("PUT /me",async ()=>{

        // CHANGE THE USER
        let user = { 
            password: 'jiji',
            email: 'jose.jose@gmail.com',
            name: 'José Ignacio',
            surname: 'Sbruzzi',
        }

        const rPut = await requestWithAuth("97452","jojo","PUT","/me",user)
        console.log("================")
        console.log("================")
        console.log(rPut.body)
        console.log("================")
        console.log("================")


        //TRY TO LOGIN AS BEFORE
        const r0 = await login("97452","jojo")
        expect(r0.statusCode).to.be.eq(401)


        //TRY TO LOIGN WITH NEW CREDENTIALS
        const r = await requestWithAuth("97452","jiji","GET","/me")
        console.log("================")
        console.log("================")
        console.log(r.body)
        console.log("================")
        console.log("================")
        let user2 = { 
            username: '97452',
            password: 'jiji',
            email: 'jose.jose@gmail.com',
            name: 'José Ignacio',
            surname: 'Sbruzzi',
            roles: [ 'students' ] ,
            regular:true
        }
        let schema2={
            required:["me"],
            properties:{
                "me":{const:user2}
            }
        }
        expect(r.body).to.be.jsonSchema(schema2)


        //BACK TO OLD CREDENTIALS
        let user3 = { 
            password: 'jojo',
            email: 'jose.jose@gmail.com',
            name: 'José Ignacio',
            surname: 'Sbruzzi',
            regular:true
        }

        const rPut2 = await requestWithAuth("97452","jojo","PUT","/me",user3)
        console.log("================")
        console.log("================")
        console.log(r.body)
        console.log("================")
        console.log("================")

    })

})