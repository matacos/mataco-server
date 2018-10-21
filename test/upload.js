const Readable = require('stream').Readable;
const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect
const fs=require("fs")

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

async function uploadWithAuth(username,password,verb,uriPart,fileText){
    const loginResponse=await login(username,password)
    const token=loginResponse.token
    const textBuffer = Buffer.from(fileText, 'utf8');
    const readable = new Readable()
    readable.push(textBuffer)
    readable.push(null)

    const response=await request({
        uri:url(uriPart),
        method:verb,
        headers:{
            "Authorization":"bearer "+token
        },
        simple:false,
        resolveWithFullResponse:true,
        json:true,
        formData:{
            csv:{
                value:readable,
                options:{
                    filename:"csv",
                    knownLength: textBuffer.length
                }
            }
        }
    })
    return response
}

describe("File uploads to /estudiantes/csv",()=>{
    it("upload",async ()=>{
        const oneLiner = "97452,97452,Jose,Sbrubru,3,jose.sbrubru@gmail.com,11-10"
        console.log("$$$$$$$")
        const response = await uploadWithAuth("jose","jojo","POST","/estudiantes/csv",oneLiner)
        console.log("$$$$$$$")
        console.log(response.body)
    })
})